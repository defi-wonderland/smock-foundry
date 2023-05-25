import { Ast, ContractDefinitionNode, VariableDeclarationNode } from "./types";
import { capitalizeFirstLetter, typeFix } from "./utils";

export const getDataFunctions = (ast: Ast): string => {
  // Grab the ContractDefinition node that has all the nodes for the contract
  const contractNode: ContractDefinitionNode = ast.nodes.find(
    (node): node is ContractDefinitionNode =>
      node.nodeType === "ContractDefinition"
  );

  // Checks if contract node exist
  if (!contractNode) {
    throw new Error(`Invalid target ast: ${ast.absolutePath}`);
  }

  // Get the contract's name
  const contractName: string = contractNode.name;

  // Array with functions
  const functions: string[] = [];

  // Filter the nodes and keep only the VariableDeclaration related ones
  const variableNodes: VariableDeclarationNode[] = contractNode.nodes.filter(
    (node): node is VariableDeclarationNode =>
      node.nodeType === "VariableDeclaration"
  );

  // Find the node from the functionNodes that is the array
  const arrayNodes: VariableDeclarationNode[] = variableNodes.filter((node) =>
    node.typeDescriptions.typeString.includes("[]")
  );

  // Create the string with all mock for arrays
  arrayNodes.forEach((arrayNode: VariableDeclarationNode) => {
    // Get the current function
    const arrayFunc = getArrayFunction(arrayNode, contractName);
    functions.push(arrayFunc);
  });

  // Find the node from the functionNodes that is the mapping
  const mappingNodes: VariableDeclarationNode[] = variableNodes.filter((node) =>
    node.typeDescriptions.typeString.includes("mapping")
  );

  // Create the string with all mock for mappings
  mappingNodes.forEach((mappingNode: VariableDeclarationNode) => {
    // Get the current function
    const arrayFunc = getMappingFunction(mappingNode, contractName);
    functions.push(arrayFunc);
  });

  // Concat all the functions
  const allFunctions = functions.join("\n");
  return allFunctions;
};

function getArrayFunction(
  arrayNode: VariableDeclarationNode,
  contractName: string
): string {
  // Name of the array
  const arrayName: string = arrayNode.name;
  // Type string
  const typeString: string = arrayNode.typeDescriptions.typeString;

  // Craft the string for mock and setter
  const arrayFunc =
    `\n` +
    `\tfunction mock_set${capitalizeFirstLetter(
      arrayName
    )}(${typeString} memory _${arrayName}) public {\n` +
    `\t  ${arrayName} = _${arrayName};\n` +
    `\t}\n\n` +
    `\tfunction mock_${arrayName}(${typeString} memory _${arrayName}) public {\n` +
    `\t vm.mockCall(\n` +
    `\t  address(this),\n` +
    `\t  abi.encodeWithSelector(I${contractName}.${arrayName}.selector),\n` +
    `\t  abi.encode(_${arrayName})\n` +
    `\t  );\n` +
    `\t}`;
  // Return the array function
  return arrayFunc;
}

function getMappingFunction(
  mappingNode: VariableDeclarationNode,
  contractName: string
): string {
  // Name of the array
  const mappingName: string = mappingNode.name;
  // Type name
  const keyName: string = typeFix(mappingNode.typeName.keyType.name);
  // Value type
  const valueType: string = typeFix(mappingNode.typeName.valueType.name);
  // Construct the params string
  const params = `${keyName} _key, ${valueType} _value`;

  // Craft the string for mock and setter
  const mappingFunc =
    `\n` +
    `\tfunction mock_set${capitalizeFirstLetter(
      mappingName
    )}(${params}) public {\n` +
    `\t  ${mappingName}[_key] = _value;\n` +
    `\t}\n\n` +
    `\tfunction mock_${mappingName}(${params}) public {\n` +
    `\t vm.mockCall(\n` +
    `\t  address(this),\n` +
    `\t  abi.encodeWithSelector(I${contractName}.${mappingName}.selector, _key),\n` +
    `\t  abi.encode(_value)\n` +
    `\t  );\n` +
    `\t}`;
  return mappingFunc;
}
