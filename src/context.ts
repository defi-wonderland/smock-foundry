import { ExternalFunctionContext, ConstructorContext, InternalFunctionContext, ImportContext, MappingVariableContext, ArrayVariableContext, StateVariableContext } from './types';
import {
  sanitizeParameterType,
  explicitTypeStorageLocation,
  extractParameters,
  extractReturnParameters
} from './utils';
import { ContractDefinition, FunctionDefinition, VariableDeclaration, Identifier, ImportDirective } from 'solc-typed-ast';

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
    parameterNames: parameterNames.join(', '),
    contractName: (node.vScope as ContractDefinition).name
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
  const baseType: string = sanitizeParameterType(explicitTypeStorageLocation(node.vType['vBaseType'].typeString));

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
