export interface VariableDeclarationNode {
  constant: boolean;
  name: string;
  nodeType: "VariableDeclaration";
  storageLocation: string;
  typeDescriptions: {
    typeString: string;
  };
}

export interface ContractDefinitionNode {
  nodeType: "ContractDefinition";
  nodes: AstNode[];
  abstract: boolean;
  baseContracts: any[];
  name: string;
}

export interface FunctionDefinitionNode {
  nodeType: "FunctionDefinition";
  kind: string;
  parameters: {
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
  components: null | string;
  arrayLength: null | string;
  arrayChildren: null | string;
}

export type AstNode =
  | ImportDirectiveNode
  | FunctionDefinitionNode
  | ContractDefinitionNode;

export const memoryTypes = [
  "string",
  "bytes",
  "bytes32",
  "bytes64",
  "bytes128",
  "bytes256",
  "array",
  "mapping",
];
