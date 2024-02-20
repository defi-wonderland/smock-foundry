import Handlebars from 'handlebars';
import { writeFileSync } from 'fs';
import { ensureDir, emptyDir } from 'fs-extra';
import { ASTKind, ASTReader, compileSol, FunctionDefinition, VariableDeclaration, Identifier, ImportDirective } from 'solc-typed-ast';
import {
  registerHandlebarsTemplates,
  registerSmockHelperTemplate,
  getSolidityFilesAbsolutePaths,
  readPartial,
  sanitizeParameterType,
  explicitTypeStorageLocation
} from './utils';
import { ExternalFunctionContext, ConstructorContext, InternalFunctionContext, ImportContext, MappingVariableContext, ArrayVariableContext, StateVariableContext } from './types';

/**
 * Generates the mock contracts
 * @param mocksDirectory The directory where the mock contracts will be generated
 */
export async function generateMockContracts(mocksDirectory: string) {
  const contractTemplateContent: string = registerHandlebarsTemplates();
  const contractTemplate = Handlebars.compile(contractTemplateContent);
  // Create the directory if it doesn't exist
  try {
    await ensureDir(mocksDirectory);
  } catch (error) {
    console.error('Error while creating the mock directory: ', error);
  }

  // Empty the directory, if it exists
  try {
    await emptyDir(mocksDirectory);
  } catch (error) {
    console.error('Error while trying to empty the mock directory: ', error);
  }

  try {
    console.log('Parsing contracts...');

    try {
      const contractName = 'ContractTest';
      const includedPaths = [`solidity/contracts/${contractName}.sol`];
      const solidityFiles: string[] = await getSolidityFilesAbsolutePaths(includedPaths);
      const rootPath = './';
      const remappings = [];

      const compiledFiles = await compileSol(solidityFiles, 'auto', {
        basePath: rootPath,
        remapping: remappings,
        includePath: [rootPath],
      });

      const sourceUnits = new ASTReader().read(compiledFiles.data, ASTKind.Any, compiledFiles.files).filter((sourceUnit) => includedPaths.includes(sourceUnit.absolutePath));

      for(const sourceUnit of sourceUnits) {
        let importsContent = '';
        // First process the imports, they will be on top of each mock contract
        for(const importDirective of sourceUnit.vImportDirectives) {
          const context = importContext(importDirective);
          const partialContent = await readPartial('import');
          const partial = Handlebars.compile(partialContent);
          importsContent += partial(context);
        }

        let mockContent = '';
        for(const contract of sourceUnit.vContracts) {
          for(const node of contract.children) {
            if (node instanceof VariableDeclaration) {
              // If the state variable is constant then we don't need to mock it
              if (node.constant || node.mutability === 'immutable') continue;
              // If the state variable is private we don't mock it
              if (node.visibility === 'private') continue;

              // Get the type of the state variable
              const stateVariableType: string = node.typeString;
              let context;
              let partialContent;
              let partial;

              if (stateVariableType.startsWith('mapping')) {
                context = mappingVariableContext(node);
                partialContent = await readPartial('mapping-state-variable');
                partial = Handlebars.compile(partialContent);
              } else if (stateVariableType.includes('[]')) {
                context = arrayVariableContext(node);
                partialContent = await readPartial('array-state-variable');
                partial = Handlebars.compile(partialContent);
              } else {
                context = stateVariableContext(node);
                partialContent = await readPartial('state-variable');
                partial = Handlebars.compile(partialContent);
              }

              mockContent += partial(context);
            } else if (node instanceof FunctionDefinition) {
              if(node.isConstructor) {
                const context = constructorContext(node);
                const partialContent = await readPartial('constructor');
                const partial = Handlebars.compile(partialContent);
                mockContent += partial({...context, contractName: contract.name});
              } else if (node.visibility === 'external' || node.visibility === 'public') {
                const context = externalOrPublicFunctionContext(node);
                const partialContent = await readPartial('external-or-public-function');
                const partial = Handlebars.compile(partialContent);
                mockContent += partial(context);
              } else if(node.visibility === 'internal' && node.virtual) {
                const context = internalFunctionContext(node);
                const partialContent = await readPartial('internal-function');
                const partial = Handlebars.compile(partialContent);
                mockContent += partial(context);
              }
            }
          }

          const scope = contract.vScope;
          const contractCode: string = contractTemplate({
            content: mockContent,
            importsContent: importsContent,
            contractName: contract.name,
            contractAbsolutePath: scope.absolutePath,
            exportedSymbols: Array.from(scope.exportedSymbols.keys()),
          })
          // TODO: check if there are other symbols we should account for, or if there is a better way to handle this
          // TODO: Check if there is a better way to handle the HTML encoded characters, for instance with `compile` options
          .replace(/&#x27;/g, "'")
          .replace(/&#x3D;/g, '=')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&lt;/g, '<')
          .replace(/;;/g, ';');

          writeFileSync(`${mocksDirectory}/Mock${contract.name}.sol`, contractCode);
        }
      }
      
      // Generate SmockHelper contract
      const smockHelperTemplateContent: string = registerSmockHelperTemplate();
      const smockHelperTemplate = Handlebars.compile(smockHelperTemplateContent);
      const smockHelperCode: string = smockHelperTemplate({});
      writeFileSync(`${mocksDirectory}/SmockHelper.sol`, smockHelperCode);

      console.log('Mock contracts generated successfully');

      // TODO: Compile the mock contracts
      // await compileSolidityFilesFoundry(mocksDirectory);
    } catch(error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}

export function extractParameters(parameters: VariableDeclaration[]): { functionParameters: string[], parameterTypes: string[], parameterNames: string[] } {
  const functionParameters = parameters.map((parameter, index) => {
    const typeName: string = sanitizeParameterType(parameter.typeString);
    const paramName: string = parameter.name || `_param${index}`;
    const storageLocation = ['memory', 'calldata'].includes(parameter.storageLocation) ? `${parameter.storageLocation} ` : '';
    return `${typeName} ${storageLocation}${paramName}`;
  });

  const parameterTypes = parameters.map(parameter => sanitizeParameterType(parameter.typeString));
  const parameterNames = parameters.map((parameter, index) => parameter.name || `_param${index}`);

  return {
    functionParameters,
    parameterTypes,
    parameterNames
  }
}

export function extractReturnParameters(returnParameters: VariableDeclaration[]): { functionReturnParameters: string[], returnParameterTypes: string[], returnParameterNames: string[] } {
  const functionReturnParameters = returnParameters.map((parameter: VariableDeclaration, index: number) => {
    const typeName: string = sanitizeParameterType(parameter.typeString);
    const paramName: string = parameter.name === '' ? `_returnParam${index}` : parameter.name;
    const storageLocation = ['memory', 'calldata'].includes(parameter.storageLocation) ? `${parameter.storageLocation} ` : '';
    return `${typeName} ${storageLocation}${paramName}`;
  });

  const returnParameterTypes = returnParameters.map(parameter => sanitizeParameterType(parameter.typeString));
  const returnParameterNames = returnParameters.map((parameter, index) => parameter.name === '' ? `_returnParam${index}` : parameter.name);

  return {
    functionReturnParameters,
    returnParameterTypes,
    returnParameterNames
  }
}

export function internalFunctionContext(node: FunctionDefinition): InternalFunctionContext {
  // Check if the function is internal
  if (node.visibility !== 'internal') throw new Error('The function is not internal');
  // Check if the function is internal
  if(!node.virtual) throw new Error('The function is not virtual');

  const { functionParameters, parameterTypes, parameterNames } = extractParameters(node.vParameters.vParameters);
  const { functionReturnParameters, returnParameterTypes, returnParameterNames } = extractReturnParameters(node.vReturnParameters.vParameters);
  const signature = parameterTypes ? `${node.name}(${parameterTypes.join(',')})` : `${node.name}()`;

  // Create the string that will be used in the mock function signature
  const inputs: string = functionParameters.length ? functionParameters.join(', ') : '';
  const outputs: string = functionReturnParameters.length ? functionReturnParameters.join(', ') : '';

  let params: string;
  if (!inputs) {
    params = outputs;
  } else if (!outputs) {
    params = inputs;
  } else {
    params = `${inputs}, ${outputs}`;
  }

  // Check if the function is view
  const isView = node.stateMutability === 'view';

  // Save the internal function information
  return {
    functionName: node.name,
    signature: signature,
    parameters: params,
    inputs: inputs,
    outputs: outputs,
    inputTypes: parameterTypes,
    outputTypes: returnParameterTypes,
    inputNames: parameterNames,
    outputNames: returnParameterNames,
    isView: isView,
    implemented: node.implemented,
  };
}

export function externalOrPublicFunctionContext(node: FunctionDefinition): ExternalFunctionContext {
  // Check if the function is external or public
  if (node.visibility != 'external' && node.visibility != 'public') throw new Error('The function is not external or public');

  // Save state mutability
  const stateMutability = node.stateMutability === 'nonpayable' ? ' ' : ` ${node.stateMutability} `;

  const { functionParameters, parameterTypes, parameterNames } = extractParameters(node.vParameters.vParameters);
  const { functionReturnParameters, returnParameterNames } = extractReturnParameters(node.vReturnParameters.vParameters);
  const signature = parameterTypes ? `${node.name}(${parameterTypes.join(',')})` : `${node.name}()`;

  // Create the string that will be used in the mock function signature
  const inputs: string = functionParameters.length ? functionParameters.join(', ') : '';
  const outputs: string = functionReturnParameters.length ? functionReturnParameters.join(', ') : '';

  let params: string;
  if (!inputs) {
    params = outputs;
  } else if (!outputs) {
    params = inputs;
  } else {
    params = `${inputs}, ${outputs}`;
  }

  // Save the external function information
  return {
    functionName: node.name,
    signature: signature,
    parameters: params,
    inputs: inputs,
    outputs: outputs,
    inputNames: parameterNames,
    outputNames: returnParameterNames,
    visibility: node.visibility,
    stateMutability: stateMutability,
    implemented: node.implemented,
  };
}

export function constructorContext(node: FunctionDefinition): ConstructorContext {
  if(!node.isConstructor) throw new Error('The node is not a constructor');

  // Get the parameters of the constructor, if there are no parameters then we use an empty array
  const { functionParameters: parameters, parameterNames } = extractParameters(node.vParameters.vParameters);

  return {
    parameters: parameters.join(', '),
    parameterNames: parameterNames.join(', ')
  }
}

export function importContext(node: ImportDirective): ImportContext {
  // Get the absolute path and the symbol aliases, the symbol aliases are the named imports
  const { symbolAliases, absolutePath } = node;

  // If there are no named imports then we import the whole file
  if (!symbolAliases.length) return { absolutePath}

  // Get the names of the named imports
  const namedImports = symbolAliases.map((symbolAlias) => symbolAlias.foreign instanceof Identifier ? symbolAlias.foreign.name : symbolAlias.foreign);

  return {
    namedImports,
    absolutePath
  }
}

export function mappingVariableContext(node: VariableDeclaration): MappingVariableContext {
  // Name of the mapping
  const mappingName: string = node.name;

  // Type name
  let mappingTypeNameNode = node.vType;

  // Key types
  const keyTypes: string[] = [];

  do {
    const keyType: string = sanitizeParameterType(explicitTypeStorageLocation(mappingTypeNameNode['vKeyType'].typeString));
    keyTypes.push(keyType);
    mappingTypeNameNode = mappingTypeNameNode['vValueType'];
  } while (mappingTypeNameNode.typeString.startsWith('mapping'));

  // Value type
  const valueType: string = sanitizeParameterType(explicitTypeStorageLocation(mappingTypeNameNode.typeString));

  // Array flag
  const isArray: boolean = valueType.includes('[]');

  // Base type
  const baseType: string = isArray ? sanitizeParameterType(explicitTypeStorageLocation(mappingTypeNameNode['vBaseType'].typeString)) : valueType;

  // Struct array flag
  const isStructArray: boolean = isArray && mappingTypeNameNode.typeString.startsWith('struct ');

  // If the mapping is internal we don't create mockCall for it
  const isInternal: boolean = node.visibility === 'internal';

  return {
    setFunction: {
      functionName: mappingName,
      keyTypes: keyTypes,
      valueType: valueType,
    },
    mockFunction: {
      functionName: mappingName,
      keyTypes: keyTypes,
      valueType: valueType,
      baseType: baseType,
    },
    isInternal: isInternal,
    isArray: isArray,
    isStructArray: isStructArray,
  };
}

export function arrayVariableContext(node: VariableDeclaration): ArrayVariableContext {
  // Name of the array
  const arrayName: string = node.name;

  // Array type
  const arrayType: string = sanitizeParameterType(explicitTypeStorageLocation(node.typeString));

  // Base type
  const baseType: string = sanitizeParameterType(explicitTypeStorageLocation(node.vType.typeString));

  // Struct flag
  const isStructArray: boolean = node.typeString.startsWith('struct ');

  // If the array is internal we don't create mockCall for it
  const isInternal: boolean = node.visibility === 'internal';

  return {
    setFunction: {
      functionName: arrayName,
      arrayType: arrayType,
      paramName: arrayName,
    },
    mockFunction: {
      functionName: arrayName,
      arrayType: arrayType,
      baseType: baseType,
    },
    isInternal: isInternal,
    isStructArray: isStructArray,
  };
}

export function stateVariableContext(node: VariableDeclaration): StateVariableContext {
  // Name of the variable
  const variableName: string = node.name;

  // Remove spec type leading string
  const variableType: string = sanitizeParameterType(explicitTypeStorageLocation(node.typeString));

  // If the variable is internal we don't create mockCall for it
  const isInternal: boolean = node.visibility === 'internal';

  // Save the state variable information
  return {
    setFunction: {
      functionName: variableName,
      paramType: variableType,
      paramName: variableName,
    },
    mockFunction: {
      functionName: variableName,
      paramType: variableType,
    },
    isInternal: isInternal,
  };
}
