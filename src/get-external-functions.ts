import { ContractDefinitionNode, FunctionDefinitionNode, VariableDeclarationNode, ExternalFunctionOptions } from './types';
import { typeFix } from './utils';

/**
 * Returns the information of the external function for the mock contract
 * @param contractNode The contract node that has all the nodes for the contract
 * @returns The information of the external function for the mock contract
 */
export const getExternalMockFunctions = (contractNode: ContractDefinitionNode): ExternalFunctionOptions[] => {
  // Filter the nodes and keep only the FunctionDefinition related ones
  const functionNodes = contractNode.nodes.filter((node) => node.nodeType === 'FunctionDefinition') as FunctionDefinitionNode[];

  const externalFunctions: ExternalFunctionOptions[] = [];
  // Loop through the function nodes
  functionNodes.forEach((funcNode: FunctionDefinitionNode) => {
    // Check if the node is a function kind (not a constructor, modifier etc.)
    if (funcNode.kind != 'function') return;
    // Check if the function is external or public
    if (funcNode.visibility != 'external' && funcNode.visibility != 'public') return;

    // Save state mutability
    const stateMutability = funcNode.stateMutability === 'nonpayable' ? ' ' : ` ${funcNode.stateMutability} `;

    // Get the parameters of the function, if there are no parameters then we use an empty array
    const parameters: VariableDeclarationNode[] = funcNode.parameters.parameters ? funcNode.parameters.parameters : [];

    // We save the parameters in an array with their types and storage location
    const functionParameters: string[] = [];
    // We save the types in an array to use them in order to create the signature
    const parameterTypes: string[] = [];
    // We save the parameters names in another array
    const parameterNames: string[] = [];

    let parameterIndex = 0;
    parameters.forEach((parameter: VariableDeclarationNode) => {
      // We remove the 'contract ' string from the type name if it exists
      const typeName: string = typeFix(parameter.typeDescriptions.typeString);
      const paramName: string = parameter.name == '' ? `_param${parameterIndex}` : parameter.name;

      // If the storage location is memory or calldata then we keep it
      const storageLocation =
        parameter.storageLocation === 'memory' || parameter.storageLocation === 'calldata' ? `${parameter.storageLocation} ` : '';

      // We create the string that will be used in the constructor signature
      const parameterString = `${typeName} ${storageLocation}${paramName}`;

      // We save the strings in the arrays
      functionParameters.push(parameterString);
      parameterTypes.push(typeName);
      parameterNames.push(paramName);
      parameterIndex++;
    });

    const signature = parameterTypes ? `${funcNode.name}(${parameterTypes.join(',')})` : `${funcNode.name}()`;

    // Get the return parameters of the function, if there are no return parameters then we use an empty array
    const returnParameters: VariableDeclarationNode[] = funcNode.returnParameters.parameters ? funcNode.returnParameters.parameters : [];

    // We save the return parameters in an array with their types and storage location
    const functionReturnParameters: string[] = [];
    // We save the return parameters names in another array
    const returnParameterNames: string[] = [];

    parameterIndex = 0;
    returnParameters.forEach((parameter: VariableDeclarationNode) => {
      // We remove the 'contract ' string from the type name if it exists
      const typeName: string = typeFix(parameter.typeDescriptions.typeString);
      const paramName: string = parameter.name == '' ? `_returnParam${parameterIndex}` : parameter.name;
      
      // If the storage location is memory or calldata then we keep it
      const storageLocation =
        parameter.storageLocation === 'memory' || parameter.storageLocation === 'calldata' ? `${parameter.storageLocation} ` : '';

      // We create the string that will be used in the constructor signature
      const parameterString = `${typeName} ${storageLocation}${paramName}`;

      functionReturnParameters.push(parameterString);
      returnParameterNames.push(paramName);
      parameterIndex++;
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
    const externalMockFunction: ExternalFunctionOptions = {
      functionName: funcNode.name,
      signature: signature,
      parameters: params,
      inputs: inputs,
      outputs: outputs,
      inputNames: parameterNames,
      outputNames: returnParameterNames,
      visibility: funcNode.visibility,
      stateMutability: stateMutability,
      implemented: funcNode.implemented,
    };

    externalFunctions.push(externalMockFunction);
  });

  return externalFunctions;
};
