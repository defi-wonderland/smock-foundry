import {
  ContractDefinitionNode,
  VariableDeclarationNode,
  BasicStateVariableOptions,
  ArrayStateVariableOptions,
  MappingStateVariableOptions,
  StateVariablesOptions,
} from './types';
import { typeFix } from './utils';

/**
 * Returns all the mock functions information for state variables
 * @param contractNode The contract node of the AST
 * @returns All the mock functions information for state variables
 */
export const getStateVariables = (contractNode: ContractDefinitionNode): StateVariablesOptions => {
  // Filter the nodes and keep only the VariableDeclaration related ones
  const stateVariableNodes = contractNode.nodes.filter((node) => node.nodeType === 'VariableDeclaration') as VariableDeclarationNode[];

  // Define arrays to save our data
  const mappingFunctions: MappingStateVariableOptions[] = [];
  const arrayFunctions: ArrayStateVariableOptions[] = [];
  const basicStateVariableFunctions: BasicStateVariableOptions[] = [];
  // Loop through all the state variables
  stateVariableNodes.forEach((stateVariableNode: VariableDeclarationNode) => {
    // If the state variable is constant then we don't need to mock it
    if (stateVariableNode.constant || stateVariableNode.mutability == 'immutable') return;
    // If the state variable is private we don't mock it
    if (stateVariableNode.visibility == 'private') return;

    // Get the type of the state variable
    const stateVariableType: string = stateVariableNode.typeDescriptions.typeString;

    // Check if the state variable is an array or a mapping or a basic type
    if (stateVariableType.startsWith('mapping')) {
      const mappingMockFunction: MappingStateVariableOptions = getMappingFunction(stateVariableNode);
      mappingFunctions.push(mappingMockFunction);
    } else if (stateVariableType.includes('[]')) {
      const arrayMockFunction: ArrayStateVariableOptions = getArrayFunction(stateVariableNode);
      arrayFunctions.push(arrayMockFunction);
    } else {
      const basicStateVariableMockFunction: BasicStateVariableOptions = getBasicStateVariableFunction(stateVariableNode);
      basicStateVariableFunctions.push(basicStateVariableMockFunction);
    }
  });

  // Save all the mock functions information in an object
  const functions: StateVariablesOptions = {
    basicStateVariables: basicStateVariableFunctions,
    arrayStateVariables: arrayFunctions,
    mappingStateVariables: mappingFunctions,
  };

  return functions;
};

/**
 * Returns the mock function information for an array state variable
 * @param arrayNode The node of the array state variable
 * @param contractName The name of the contract
 * @returns The mock function information for an array state variable
 */
function getArrayFunction(arrayNode: VariableDeclarationNode): ArrayStateVariableOptions {
  // Name of the array
  const arrayName: string = arrayNode.name;

  // Array type
  const arrayType: string = typeFix(arrayNode.typeDescriptions.typeString).replace(/contract |struct |enum /g, '');

  // Base type
  const baseType: string = typeFix(arrayNode.typeName.baseType.typeDescriptions.typeString).replace(/contract |struct |enum /g, '');

  // Struct flag
  const isStruct: boolean = arrayNode.typeDescriptions.typeString.includes('struct ');

  // If the array is internal we don't create mockCall for it
  const isInternal: boolean = arrayNode.visibility == 'internal';

  const arrayStateVariableFunctions: ArrayStateVariableOptions = {
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
    isStruct: isStruct,
  };

  // Return the array function
  return arrayStateVariableFunctions;
}

/**
 * Returns the mock function information for a mapping state variable
 * @param mappingNode The node of the mapping state variable
 * @param contractName The name of the contract
 * @returns The mock function information for a mapping state variable
 */
function getMappingFunction(mappingNode: VariableDeclarationNode): MappingStateVariableOptions {
  // Name of the mapping
  const mappingName: string = mappingNode.name;

  // Type name
  let mappingTypeNameNode = mappingNode.typeName;

  // Key types
  const keyTypes: string[] = [];
  
  do {
    const keyType: string = typeFix(mappingTypeNameNode.keyType.typeDescriptions.typeString).replace(/contract |struct |enum /g, '');
    keyTypes.push(keyType);
    mappingTypeNameNode = mappingTypeNameNode.valueType;
  } while (mappingTypeNameNode.typeDescriptions.typeString.startsWith('mapping'));

  // Value type
  const valueType: string = typeFix(mappingTypeNameNode.typeDescriptions.typeString).replace(/contract |struct |enum /g, '');

  // Array flag
  const isArray: boolean = valueType.includes('[]');

  // Base type
  const baseType: string = isArray ? typeFix(mappingTypeNameNode.baseType.typeDescriptions.typeString).replace(/contract |struct |enum /g, '') : valueType;

  // If the mapping is internal we don't create mockCall for it
  const isInternal: boolean = mappingNode.visibility == 'internal';

  const mappingStateVariableFunction: MappingStateVariableOptions = {
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
  };

  // Return the mapping function
  return mappingStateVariableFunction;
}

/**
 * Returns the mock function information for a basic state variable
 * @param variableNode The node of the basic state variable
 * @param contractName The name of the contract
 * @returns The mock function information for a basic state variable
 */
function getBasicStateVariableFunction(variableNode: VariableDeclarationNode): BasicStateVariableOptions {
  // Name of the variable
  const variableName: string = variableNode.name;

  // remove spec type leading string
  const variableType: string = typeFix(variableNode.typeDescriptions.typeString).replace(/contract |struct |enum /g, '');

  // If the variable is internal we don't create mockCall for it
  const isInternal: boolean = variableNode.visibility == 'internal';

  // Save the state variable information
  const basicStateVariableFunctions: BasicStateVariableOptions = {
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

  return basicStateVariableFunctions;
}
