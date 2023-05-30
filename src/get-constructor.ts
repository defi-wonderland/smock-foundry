import {
  Ast,
  ContractDefinitionNode,
  FunctionDefinitionNode,
  VariableDeclarationNode,
} from "./types";

/**
 * Return the constructor of the contract
 * @param ast The ast of the contract from foundry's compiled artifacts
 * @returns The constructor of the contract
 */
export const getConstructor = (ast: Ast): string => {
  // Grab the ContractDefinition node that has all the nodes for the contract
  // TODO: check what happens if there are more than 1 contracts in a single file
  const contractNode = ast.nodes.find(
    (node) => node.nodeType === "ContractDefinition"
  ) as ContractDefinitionNode;

  // Get the contract's name
  const contractName: string = contractNode.name;
  
  // Filter the nodes and keep only the FunctionDefinition related ones
  const functionNodes = contractNode.nodes.filter(
    (node) => node.nodeType === "FunctionDefinition"
  ) as FunctionDefinitionNode[];

  // Find the node from the functionNodes that is the constructor
  const constructorNode = functionNodes.find(
    node => node.kind === "constructor"
  ) as FunctionDefinitionNode;
  
  // If there is no constructor then return an empty string
  if(!constructorNode) return "";
  // Get the parameters of the constructor, if there are no parameters then we use an empty array
  const parameters: VariableDeclarationNode[] =
    constructorNode.parameters.parameters ? constructorNode.parameters.parameters : [];
  
  // We save the parameters in an array with their types and storage location
  const mockConstructorParameters: string[] = [];
  // We save the parameters names in an other array
  const parameterNames: string[] = [];

  parameters.forEach((parameter) => {
    // If the storage location is memory or calldata then we keep it
    const storageLocation =
      parameter.storageLocation === 'memory' ||
      parameter.storageLocation === 'calldata'
        ? `${parameter.storageLocation} `
        : '';
    
    // We remove the "contract " string from the type name if it exists
    const typeName: string = parameter.typeDescriptions.typeString.replace(
      /contract /g,
      ""
    );

    // We create the string that will be used in the constructor signature
    const parameterString = `${typeName} ${storageLocation}${parameter.name}`;

    // We save the strings in the arrays
    mockConstructorParameters.push(parameterString);
    parameterNames.push(parameter.name);
  });

  // We join the arrays with a comma and a space between them
  const mockConstructorParametersString = mockConstructorParameters.join(", ");
  const parameterNamesString = parameterNames.join(", ");

  // Create the constructor signature and return it
  const constructorSignature = `constructor(${mockConstructorParametersString}) ${contractName}(${parameterNamesString}) {}`;
  return constructorSignature;
};
