export interface VariableDeclarationNode {
  constant: boolean;
  name: string;
  nodeType: "VariableDeclaration";
  storageLocation: string;
  typeDescriptions: {
    typeString: string;
  };
  typeName: {
    keyType: {
      typeDescriptions: {
        typeString: string;
      };
    };
    valueType: {
      typeDescriptions: {
        typeString: string;
      };
    };
  };
}

export interface ContractDefinitionNode {
  nodeType: "ContractDefinition";
  nodes: AstNode[];
  abstract: boolean;
  baseContracts: any[];
  contractKind: string;
  name: string;
}

export interface FunctionDefinitionNode {
  name: string;
  nodeType: "FunctionDefinition";
  kind: string;
  parameters: {
    parameters: VariableDeclarationNode[];
  };
  returnParameters: {
    parameters: VariableDeclarationNode[];
  };
  virtual: boolean;
  visibility: string;
}

export interface Ast {
  absolutePath: string;
  id: number;
  exportedSymbols: { [key: string]: any };
  nodeType: string;
  src: string;
  nodes: AstNode[];
  license: string;
}

export interface ImportDirectiveNode {
  nodeType: "ImportDirective";
  absolutePath: string;
  file: string;
  symbolAliases: {
    foreign: {
      name: string;
      nodeType: "Identifier";
    };
  }[];
}

export interface OutputType {
  name: string;
  type: string;
  baseType: string;
  indexed?: boolean;
  components: null | any;
  arrayLength: null | any;
  arrayChildren: null | any;
}

export type AstNode =
  | ImportDirectiveNode
  | FunctionDefinitionNode
  | ContractDefinitionNode
  | VariableDeclarationNode;

/**
 * The options of the BasicStateVariable template for the setFunction section
 * @param functionName The name of the function, this is gonna be the state variable name with the first letter capitalized
 * @param paramType The type of the state variable we mock
 * @param paramName The name of the state variable we mock, this is the name of the state variable
 */
export interface BasicStateVariableSetOptions {
  functionName: string;
  paramType: string;
  paramName: string;
}

/**
 * The options of the BasicStateVariable template for the mockFunction section
 * @param functionName The name of the function, this is gonna be the state variable name
 * @param paramType The type of the state variable we mock
 * @param contractName The name of the contract we mock, we add an "I" infront in the template
 */
export interface BasicStateVariableMockOptions {
  functionName: string;
  paramType: string;
  contractName: string;
}

export interface BasicStateVariableOptions {
  setFunction: BasicStateVariableSetOptions;
  mockFunction: BasicStateVariableMockOptions;
}

export interface StateVariablesOptions {
  basicStateVariables: BasicStateVariableOptions[];
  arrayStateVariables: BasicStateVariableOptions[];
  mappingStateVariables: MappingStateVariableOptions[];
}

export interface ExternalFunctionOptions {
  functionName: string;
  arguments: string;
  contractName: string;
  inputsStringNames: string;
  outputsStringNames: string;
}

export interface MappingStateVariableOptions {
  setFunction: {
    functionName: string;
    keyType: string;
    valueType: string;
    mappingName: string;
  },
  mockFunction: {
    functionName: string;
    keyType: string;
    valueType: string;
    contractName: string;
  }
}

export const memoryTypes = ["string", "bytes", "[]", "mapping"];

export const arrayRegex = /(\w+)\[\]/;
