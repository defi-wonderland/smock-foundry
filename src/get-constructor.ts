import {
  ContractDefinitionNode,
  FunctionDefinitionNode,
  VariableDeclarationNode,
} from "./types";

/**
 * Return the constructor of the contract
 * @param contractNode The contract node that has all the nodes for the contract
 * @returns The constructor of the contract
 */
export const getConstructor = (contractNode: ContractDefinitionNode): string => {
  // Get the contract's name
  const contractName: string = contractNode.name;
  
  // Filter the nodes and keep only the FunctionDefinition related ones
  const functionNodes = contractNode.nodes.filter(
    (node) => node.nodeType === "FunctionDefinition"
  ) as FunctionDefinitionNode[];
  if(!functionNodes) return;

  // Find the node from the functionNodes that is the constructor
  const constructorNode = functionNodes.find(
    node => node.kind === "constructor"
  ) as FunctionDefinitionNode;
  if (!constructorNode || constructorNode.kind !== "constructor") return;
  
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
    const typeName: string = parameter.typeDescriptions.typeString.replace(/contract |struct |enum /g, '');

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
