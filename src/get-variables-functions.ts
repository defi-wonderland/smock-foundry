import { 
  ContractDefinitionNode,
  VariableDeclarationNode,
  BasicStateVariableOptions,
  BasicStateVariableSetOptions,
  BasicStateVariableMockOptions,
  MappingStateVariableOptions,
  StateVariablesOptions
} from './types';
import { capitalizeFirstLetter, typeFix } from './utils';

/**
 * Returns all the mock functions information for state variables
 * @param contractNode The contract node of the AST
 * @returns All the mock functions information for state variables
 */
export const getStateVariables = (contractNode: ContractDefinitionNode): StateVariablesOptions => {
  // Get the contract's name
  const contractName: string = contractNode.name;

  // Filter the nodes and keep only the VariableDeclaration related ones
  const stateVariableNodes = contractNode.nodes.filter(
    node => node.nodeType === 'VariableDeclaration'
  ) as VariableDeclarationNode[];
  
  // Define arrays to save our data
  const mappingFunctions: MappingStateVariableOptions[] = [];
  const arrayFunctions: BasicStateVariableOptions[] = [];
  const basicStateVariableFunctions: BasicStateVariableOptions[] = [];
  // Loop through all the state variables
  stateVariableNodes.forEach((stateVariableNode: VariableDeclarationNode) => {
    // If the state variable is constant then we don't need to mock it
    if(stateVariableNode.constant || stateVariableNode.mutability == 'immutable') return;
    // If the state variable is internal or private we don't mock it
    if(stateVariableNode.visibility == 'internal' || stateVariableNode.visibility == 'private') return;

    // Get the type of the state variable
    const stateVariableType: string = stateVariableNode.typeDescriptions.typeString;

    // If nested mapping return
    if(stateVariableType.includes('=> mapping')) return;

    // Check if the state variable is an array or a mapping or a basic type
      if(stateVariableType.startsWith('mapping')) {
        const mappingMockFunction: MappingStateVariableOptions = getMappingFunction(stateVariableNode, contractName);
        mappingFunctions.push(mappingMockFunction);
      } else if(stateVariableType.includes('[]')) {
        const arrayMockFunction: BasicStateVariableOptions = getArrayFunction(stateVariableNode, contractName);
        arrayFunctions.push(arrayMockFunction);
      } else if(stateVariableType.includes('struct')) {
        // Do nothing for now
      } else if(stateVariableType.includes('enum')) {
        // Do nothing for now
    } else {
      const basicStateVariableMockFunction: BasicStateVariableOptions = getBasicStateVariableFunction(stateVariableNode, contractName);
      basicStateVariableFunctions.push(basicStateVariableMockFunction);
    }
  });

  // Save all the mock functions information in an object
  const functions: StateVariablesOptions = {
    basicStateVariables: basicStateVariableFunctions,
    arrayStateVariables: arrayFunctions,
    mappingStateVariables: mappingFunctions 
  };

  return functions;
}

/**
 * Returns the mock function information for an array state variable
 * @param arrayNode The node of the array state variable
 * @param contractName The name of the contract
 * @returns The mock function information for an array state variable
 */
function getArrayFunction(
  arrayNode: VariableDeclarationNode,
  contractName: string
): BasicStateVariableOptions {
  // Name of the array
  const arrayName: string = arrayNode.name;
  // Type string of the array, we remove the 'contract ' string if it exists
  const arrayType: string = arrayNode.typeDescriptions.typeString.replace(/contract |struct |enum /g, '');

  const setFunction: BasicStateVariableSetOptions = {
    functionName: capitalizeFirstLetter(arrayName),
    paramType: arrayType,
    paramName: arrayName,
  };
  // Save the mock function information
  const mockFunction: BasicStateVariableMockOptions = {
    functionName: arrayName,
    paramType: arrayType,
    contractName: contractName
  };
  // Save the state variable information
  const arrayStateVariableFunctions: BasicStateVariableOptions = {
    setFunction: setFunction,
    mockFunction: mockFunction
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
function getMappingFunction(
  mappingNode: VariableDeclarationNode,
  contractName: string
): MappingStateVariableOptions {
  // Name of the mapping
  const mappingName: string = mappingNode.name;
  // Type name
  const keyType: string = typeFix(mappingNode.typeName.keyType.typeDescriptions.typeString).replace(/contract |struct |enum /g, '');
  // Value type
  const valueType: string = typeFix(mappingNode.typeName.valueType.typeDescriptions.typeString).replace(/contract |struct |enum /g, '');

  const mappingStateVariableFunction: MappingStateVariableOptions = {
    setFunction: {
      functionName: `${capitalizeFirstLetter(mappingName)}`,
      keyType: keyType,
      valueType: valueType,
      mappingName: mappingName
    },
    mockFunction: {
      functionName: mappingName,
      keyType: keyType,
      valueType: valueType,
      contractName: contractName
    }
  };

  return mappingStateVariableFunction;
}

/**
 * Returns the mock function information for a basic state variable
 * @param variableNode The node of the basic state variable
 * @param contractName The name of the contract
 * @returns The mock function information for a basic state variable
 */
function getBasicStateVariableFunction(
  variableNode: VariableDeclarationNode,
  contractName: string
): BasicStateVariableOptions {
  // Name of the variable
  const variableName: string = variableNode.name;
  // Type of the variable, we remove the 'contract ' string if it exists
  const variableType: string = typeFix(variableNode.typeDescriptions.typeString.replace(
    /contract /g,
    ''
  ));

  // Save the set function information
  const setFunction: BasicStateVariableSetOptions = {
    functionName: capitalizeFirstLetter(variableName),
    paramType: variableType,
    paramName: variableName,
  };
  // Save the mock function information
  const mockFunction: BasicStateVariableMockOptions = {
    functionName: variableName,
    paramType: variableType,
    contractName: contractName
  };
  // Save the state variable information
  const basicStateVariableFunctions: BasicStateVariableOptions = {
    setFunction: setFunction,
    mockFunction: mockFunction
  };

  return basicStateVariableFunctions;
}