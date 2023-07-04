import {
  ContractDefinitionNode,
  FunctionDefinitionNode,
  VariableDeclarationNode,
  InternalFunctionOptions,
} from "./types";

/**
 * Returns the infomration of the internal function for the mock contract
 * @param contractNode The contract node that has all the nodes for the contract
 * @returns The infomration of the internal function for the mock contract
 */
export const getInternalMockFunctions = (contractNode: ContractDefinitionNode): InternalFunctionOptions[] => {
  // Get the contract's name
  const contractName: string = contractNode.name;

  // Filter the nodes and keep only the FunctionDefinition related ones
  const functionNodes = contractNode.nodes.filter(
    (node) => node.nodeType === "FunctionDefinition"
  ) as FunctionDefinitionNode[];

  const internalFunctions: InternalFunctionOptions[] = [];
  // Loop through the function nodes
  functionNodes.forEach((funcNode: FunctionDefinitionNode) => {
    // Check if the node is a function kind (not a constructor, modifier etc.)
    if (funcNode.kind != "function") return;
    // Check if the function is internal or public
    if (funcNode.visibility != "internal" && !funcNode.virtual) return;

    // Get the parameters of the constructor, if there are no parameters then we use an empty array
    const parameters: VariableDeclarationNode[] = funcNode.parameters.parameters ? funcNode.parameters.parameters : [];

    // We save the parameters in an array with their types and storage location
    const functionParameters: string[] = [];
    // We save the parameters names in an other array
    const parameterNames: string[] = [];
    // We save the types in an array to use them in order to create the signature
    const parameterTypes: string[] = [];
    let parameterIndex = 0;
    parameters.forEach((parameter: VariableDeclarationNode) => {
      // If the storage location is memory or calldata then we keep it
      const storageLocation =
        parameter.storageLocation === "memory" || parameter.storageLocation === "calldata"
          ? `${parameter.storageLocation} `
          : "";

      // We remove the 'contract ' string from the type name if it exists
      const typeName: string = parameter.typeDescriptions.typeString.replace(/contract |struct |enum /g, "");

      const paramName: string = parameter.name == "" ? `_param${parameterIndex}` : parameter.name;
      // We create the string that will be used in the constructor signature
      const parameterString = `${typeName} ${storageLocation}${paramName}`;

      parameterTypes.push(typeName);
      functionParameters.push(parameterString);
      parameterNames.push(paramName);
      parameterIndex++;
    });

    const signature = parameterTypes ? `${funcNode.name}(${parameterTypes.join(", ")})` : `${funcNode.name}()`;

    const returnParameters: VariableDeclarationNode[] = funcNode.returnParameters.parameters
      ? funcNode.returnParameters.parameters
      : [];

    // We save the return parameters in an array with their types and storage location
    const functionReturnParameters: string[] = [];
    // We save the return parameters names in an other array
    const returnParameterNames: string[] = [];
    // We save the types of output params
    const returnParameterTypes: string[] = [];

    parameterIndex = 0;
    returnParameters.forEach((parameter: VariableDeclarationNode) => {
      // If the storage location is memory or calldata then we keep it
      const storageLocation =
        parameter.storageLocation === "memory" || parameter.storageLocation === "calldata"
          ? `${parameter.storageLocation} `
          : "";

      // We remove the 'contract ' string from the type name if it exists
      const typeName: string = parameter.typeDescriptions.typeString.replace(/contract |struct |enum /g, "");

      const returnName: string = parameter.name == "" ? `_return${parameterIndex}` : parameter.name;
      // We create the string that will be used in the constructor signature
      const parameterString = `${typeName} ${storageLocation}${returnName}`;

      functionReturnParameters.push(parameterString);
      returnParameterNames.push(returnName);
      returnParameterTypes.push(typeName);
      parameterIndex++;
    });

    // We create the string that will be used in the mock function signature
    const inputsString: string = functionParameters.length ? functionParameters.join(", ") : "";
    const outputsString: string = functionReturnParameters.length ? functionReturnParameters.join(", ") : "";

    // We create the strings that will be used in the mock call arguments and returns
    const inputsStringNames: string = parameterNames.length ? `${parameterNames.join(", ")}` : "";
    const outputsStringNames: string = returnParameterNames.length ? returnParameterNames.join(", ") : "";
    let args: string;

    if (!inputsString) {
      args = outputsString;
    } else if (!outputsString) {
      args = inputsString;
    } else {
      args = `${inputsString}, ${outputsString}`;
    }

    // Save the internal function information
    const internalMockFunction: InternalFunctionOptions = {
      functionName: funcNode.name,
      arguments: args,
      signature: signature,
      inputsStringNames: inputsStringNames,
      inputsString: inputsString,
      outputsString: outputsString,
      outputsStringNames: outputsStringNames,
      outputsTypesString: returnParameterTypes.join(", "),
    };

    internalFunctions.push(internalMockFunction);
  });

  return internalFunctions;
};
