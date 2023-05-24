import {
  Ast,
  ContractDefinitionNode,
  FunctionDefinitionNode,
  VariableDeclarationNode,
} from "./types";

export const getConstructor = (sourceFilePath: string): Promise<string> => {
  return new Promise((resolve) => {
    // Get the ast from the compiled output
    const ast: Ast = require(sourceFilePath).ast;

    // Grab the ContractDefinition node that has all the nodes for the contract
    const contractNode: ContractDefinitionNode = ast.nodes.find(
      (node): node is ContractDefinitionNode =>
        node.nodeType === "ContractDefinition"
    );
    // Get the contract's name
    const contractName: string = contractNode.name;

    // Filter the nodes and keep only the FunctionDefinition related ones
    const functionNodes: FunctionDefinitionNode[] = contractNode.nodes.filter(
      (node): node is FunctionDefinitionNode =>
        node.nodeType === "FunctionDefinition"
    );
    // Find the node from the functionNodes that is the constructor
    const constructorNode: FunctionDefinitionNode = functionNodes.find(
      (node) => node.kind === "constructor"
    );

    const parameters: VariableDeclarationNode[] =
      constructorNode.parameters.parameters;
    const mockConstructorParameters: string[] = [];
    const parameterNames: string[] = [];
    // Save their parameters with their types and storage location
    // And an other array with just the parameters names
    for (const parameter of parameters) {
      const storageLocation =
        parameter.storageLocation === "memory" ||
        parameter.storageLocation === "calldata"
          ? parameter.storageLocation
          : "";

      const typeName: string = parameter.typeDescriptions.typeString.replace(
        /contract /g,
        ""
      );
      const parameterString = `${typeName} ${storageLocation} ${parameter.name}`;
      mockConstructorParameters.push(parameterString);
      parameterNames.push(parameter.name);
    }

    const mockConstructorParametersString =
      mockConstructorParameters.join(", ");
    const parameterNamesString = parameterNames.join(", ");

    // Create the constructor signature and return it
    const constructorSignature = `constructor(${mockConstructorParametersString}) ${contractName}(${parameterNamesString}) {}`;
    resolve(constructorSignature);
  });
};
