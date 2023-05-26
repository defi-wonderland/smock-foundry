import { 
  Ast,
  ContractDefinitionNode,
  VariableDeclarationNode,
  BasicStateVariableOptions,
  BasicStateVariableSetOptions,
  BasicStateVariableMockOptions,
  MappingStateVariableOptions
} from "./types";
import { capitalizeFirstLetter, typeFix } from "./utils";

export const getArrayFunctions = (ast: Ast): BasicStateVariableOptions[] => {
  // Grab the ContractDefinition node that has all the nodes for the contract
  const contractNode = ast.nodes.find(
    node => node.nodeType === "ContractDefinition"
  ) as ContractDefinitionNode;

  // Checks if contract node exist
  if (!contractNode) {
    throw new Error(`Invalid target ast: ${ast.absolutePath}`);
  }

  // Filter the nodes and keep only the VariableDeclaration related ones
  const stateVariableNodes = contractNode.nodes.filter(
    node => node.nodeType === "VariableDeclaration"
  ) as VariableDeclarationNode[];

  // Find the nodes from the stateVariableNodes that are arrays
  const arrayVariableNodes = stateVariableNodes.filter(
    node => node.typeDescriptions.typeString.includes("[]")
  ) as VariableDeclarationNode[];

  // Get the contract's name
  const contractName: string = contractNode.name;

  // Array with functions
  const functions: string[] = [];
  // Create the string with all mock for arrays
  arrayVariableNodes.forEach((arrayNode: VariableDeclarationNode) => {
    // Get the current function
    const arrayFunc = getArrayFunction(arrayNode, contractName);
    functions.push(arrayFunc);
  });

  // Find the nodes from the stateVariableNodes that are mappings
  const mappingVariableNodes = stateVariableNodes.filter(
    node => node.typeDescriptions.typeString.includes("mapping")
  ) as VariableDeclarationNode[];

  // Create the string with all mock for mappings
  mappingVariableNodes.forEach((mappingNode: VariableDeclarationNode) => {
    // Get the current function
    const arrayFunc = getMappingFunction(mappingNode, contractName);
    functions.push(arrayFunc);
  });

  return functions;
};

function getArrayFunction(
  arrayNode: VariableDeclarationNode,
  contractName: string
): BasicStateVariableOptions {
  // Name of the array
  const arrayName: string = arrayNode.name;
  // Type string of the array, we remove the "contract " string if it exists
  const arrayType: string = arrayNode.typeDescriptions.typeString.replace(
    /contract /g,
    ""
  );

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

function getMappingFunction(
  mappingNode: VariableDeclarationNode,
  contractName: string
): MappingStateVariableOptions {
  // Name of the mapping
  const mappingName: string = mappingNode.name;
  // Type name
  const keyType: string = typeFix(mappingNode.typeName.keyType.name);
  // Value type
  const valueType: string = typeFix(mappingNode.typeName.valueType.name);

  const mappingStateVariableFunction: MappingStateVariableOptions = {
    setFunction: {
      functionName: `set${capitalizeFirstLetter(mappingName)}`,
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
