import { getExternalMockFunctions, getInternalMockFunctions, getImports, getStateVariables, Ast } from './index';
import {
  registerHandlebarsTemplates,
  compileSolidityFilesFoundry,
  registerSmockHelperTemplate,
  getSolidityFilesAbsolutePaths,
  readPartial,
  sanitizeParameterType
} from './utils';
import { ExternalFunctionContext, ConstructorContext } from './types';
import Handlebars from 'handlebars';
import { writeFileSync } from 'fs';
import { ensureDir, emptyDir } from 'fs-extra';
import { ASTKind, ASTReader, compileSol, SourceUnit, ContractDefinition, FunctionDefinition, VariableDeclaration } from 'solc-typed-ast';

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
      const contractName = 'ContractA';
      const includedPaths = [`solidity/contracts/utils/${contractName}.sol`];
      const solidityFiles: string[] = await getSolidityFilesAbsolutePaths(includedPaths);
      const rootPath = './';
      const remappings = [];

      const compiledFiles = await compileSol(solidityFiles, 'auto', {
        basePath: rootPath,
        remapping: remappings,
        includePath: [rootPath],
      });

      const sourceUnits = new ASTReader().read(compiledFiles.data, ASTKind.Any, compiledFiles.files).filter((sourceUnit) => includedPaths.includes(sourceUnit.absolutePath));

      const contracts = sourceUnits.flatMap(s => s.vContracts);
      let mockContent = '';
      for(const contract of contracts) {
        for(const node of contract.children) {
          if (node instanceof VariableDeclaration) {
            // const partialContent = await readPartial('state-variable');
            // const partial = Handlebars.compile(partialContent);
            // mockContent += partial({});
          } else if (node instanceof FunctionDefinition) {
            if(node.kind === 'constructor') {
              const constructorContent = constructorContext(node);
              const partialContent = await readPartial('constructor');
              const partial = Handlebars.compile(partialContent);
              mockContent += partial({...constructorContent, contractName: contractName});
            } else if (node.visibility === 'external' || node.visibility === 'public') {
              const functionContext = externalOrPublicFunctionContext(node);
              const partialContent = await readPartial('external-or-public-function');
              const partial = Handlebars.compile(partialContent);
              mockContent += partial(functionContext);
            } else {
              // const partialContent = await readPartial('internal-function');
              // const partial = Handlebars.compile(partialContent);
              // mockContent += partial({});
            }
          }
        }

        const scope = contract.vScope;
        const contractCode: string = contractTemplate({
          content: mockContent,
          contractName: contractName,
          contractAbsolutePath: scope.absolutePath,
          exportedSymbols: Array.from(scope.exportedSymbols.keys())
        })
        // TODO: check if there are other symbols we should account for, or if there is a better way to handle this
        // TODO: Check if there is a better way to handle the HTML encoded characters, for instance with `compile` options
        .replace(/&#x27;/g, "'")
        .replace(/&#x3D;/g, '=')
        .replace(/;;/g, ';');

        writeFileSync(`${mocksDirectory}/Mock${contractName}.sol`, contractCode);
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

export function externalOrPublicFunctionContext(node: FunctionDefinition): ExternalFunctionContext {
  // Check if the function is external or public
  if (node.visibility != 'external' && node.visibility != 'public') throw new Error('The function is not external or public');

  // Save state mutability
  const stateMutability = node.stateMutability === 'nonpayable' ? ' ' : ` ${node.stateMutability} `;

  // Get the parameters of the function, if there are no parameters then we use an empty array
  const parameters: VariableDeclaration[] = node.vParameters.vParameters ? node.vParameters.vParameters : [];

  // Save the parameters in an array with their types and storage location
  const functionParameters: string[] = [];
  // Save the types in an array to use them in order to create the signature
  const parameterTypes: string[] = [];
  // Save the parameters names in another array
  const parameterNames: string[] = [];

  parameters.forEach((parameter: VariableDeclaration, index: number) => {
    // We remove the 'contract ' string from the type name if it exists
    const typeName: string = sanitizeParameterType(parameter.typeString);
    const paramName: string = parameter.name == '' ? `_param${index}` : parameter.name;

    // If the storage location is memory or calldata then we keep it
    const storageLocation =
      parameter.storageLocation === 'memory' || parameter.storageLocation === 'calldata' ? `${parameter.storageLocation} ` : '';

    // We create the string that will be used in the constructor signature
    const parameterString = `${typeName} ${storageLocation}${paramName}`;

    // Save the strings in the arrays
    functionParameters.push(parameterString);
    parameterTypes.push(typeName);
    parameterNames.push(paramName);
    index++;
  });

  const signature = parameterTypes ? `${node.name}(${parameterTypes.join(',')})` : `${node.name}()`;

  // Get the return parameters of the function, if there are no return parameters then we use an empty array
  const returnParameters: VariableDeclaration[] = node.vReturnParameters.vParameters ? node.vReturnParameters.vParameters : [];

  // Save the return parameters in an array with their types and storage location
  const functionReturnParameters: string[] = [];
  // Save the return parameters names in another array
  const returnParameterNames: string[] = [];

  returnParameters.forEach((parameter: VariableDeclaration, index: number) => {
    // We remove the 'contract ' string from the type name if it exists
    const typeName: string = sanitizeParameterType(parameter.typeString);
    const paramName: string = parameter.name == '' ? `_returnParam${index}` : parameter.name;
    
    // If the storage location is memory or calldata then we keep it
    const storageLocation =
      parameter.storageLocation === 'memory' || parameter.storageLocation === 'calldata' ? `${parameter.storageLocation} ` : '';

    // We create the string that will be used in the constructor signature
    const parameterString = `${typeName} ${storageLocation}${paramName}`;

    functionReturnParameters.push(parameterString);
    returnParameterNames.push(paramName);
    index++;
  });

  // We create the string that will be used in the mock function signature
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
  if(node.kind !== 'constructor') throw new Error('The node is not a constructor');

  // Get the parameters of the constructor, if there are no parameters then we use an empty array
  const parameters: VariableDeclaration[] = node.vParameters.vParameters ? node.vParameters.vParameters : [];

  // Save the parameters in an array with their types and storage location
  const constructorParameters: string[] = [];
  // Save the parameters names in another array
  const parameterNames: string[] = [];

  parameters.forEach((parameter: VariableDeclaration, index: number) => {
    // Remove the 'contract ' string from the type name
    const typeName: string = sanitizeParameterType(parameter.typeString);
    const paramName: string = parameter.name === '' ? `_param${index}` : parameter.name;

    // If the storage location is memory or calldata then we keep it
    const storageLocation =
      parameter.storageLocation === 'memory' || parameter.storageLocation === 'calldata' ? `${parameter.storageLocation} ` : '';

    // Create the string that will be used in the constructor signature
    const parameterString = `${typeName} ${storageLocation}${paramName}`;

    // Save the strings in the arrays
    constructorParameters.push(parameterString);
    parameterNames.push(paramName);
    index++;
  });

  return {
    parameters: constructorParameters.join(', '),
    parameterNames: parameterNames.join(', ')
  }
}
