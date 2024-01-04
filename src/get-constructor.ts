import { ContractDefinitionNode, FunctionDefinitionNode, VariableDeclarationNode } from './types';
import { typeFix } from './utils';

/**
 * Return the constructor of the contract
 * @param contractNode The contract node that has all the nodes for the contract
 * @returns The constructor of the contract
 */
export const getConstructor = (contractNode: ContractDefinitionNode): string => {
  // Get the contract's name
  const contractName: string = contractNode.name;

  // Filter the nodes and keep only the FunctionDefinition related ones
  const functionNodes = contractNode.nodes.filter((node) => node.nodeType === 'FunctionDefinition') as FunctionDefinitionNode[];
  if (!functionNodes) return;

  // Find the node from the functionNodes that is the constructor
  const constructorNode = functionNodes.find((node) => node.kind === 'constructor') as FunctionDefinitionNode;
  if (!constructorNode || constructorNode.kind !== 'constructor') return;

  // Get the parameters of the constructor, if there are no parameters then we use an empty array
  const parameters: VariableDeclarationNode[] = constructorNode.parameters.parameters ? constructorNode.parameters.parameters : [];

  // We save the parameters in an array with their types and storage location
  const constructorParameters: string[] = [];
  // We save the parameters names in another array
  const parameterNames: string[] = [];

  let parameterIndex = 0;
  parameters.forEach((parameter) => {
    // We remove the 'contract ' string from the type name if it exists
    const typeName: string = typeFix(parameter.typeDescriptions.typeString);
    const paramName: string = parameter.name == '' ? `_param${parameterIndex}` : parameter.name;

    // If the storage location is memory or calldata then we keep it
    const storageLocation =
      parameter.storageLocation === 'memory' || parameter.storageLocation === 'calldata' ? `${parameter.storageLocation} ` : '';

    // We create the string that will be used in the constructor signature
    const parameterString = `${typeName} ${storageLocation}${paramName}`;

    // We save the strings in the arrays
    constructorParameters.push(parameterString);
    parameterNames.push(paramName);
    parameterIndex++;
  });

  // We join the arrays with a comma and a space between them
  const constructorParametersString = constructorParameters.join(', ');
  const parameterNamesString = parameterNames.join(', ');

  // Create the constructor signature and return it
  const constructorSignature = `constructor(${constructorParametersString}) ${contractName}(${parameterNamesString}) {}`;
  return constructorSignature;
};
