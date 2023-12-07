export interface TypeNameNode {
  nodeType?: 'ElementaryTypeName' | 'ArrayTypeName' | 'Mapping' | 'UserDefinedTypeName';
  typeDescriptions?: {
    typeString: string;
  };
  baseType?: TypeNameNode;
  keyType?: TypeNameNode;
  valueType?: TypeNameNode;
  name?: string;
  keyName?: string;
  valueName?: string;
  stateMutability?: string;
}

export interface VariableDeclarationNode {
  nodeType: 'VariableDeclaration';
  typeDescriptions: {
    typeString: string;
  };
  typeName?: TypeNameNode;
  name?: string;
  constant?: boolean;
  mutability?: string;
  visibility?: string;
  stateVariable?: boolean;
  storageLocation?: string;
}

export interface ContractDefinitionNode {
  nodeType: 'ContractDefinition';
  canonicalName: string;
  nodes: AstNode[];
  abstract: boolean;
  contractKind: string;
  name: string;
}

export interface FunctionDefinitionNode {
  name: string;
  nodeType: 'FunctionDefinition';
  kind: string;
  parameters: {
    parameters: VariableDeclarationNode[];
  };
  returnParameters: {
    parameters: VariableDeclarationNode[];
  };
  virtual: boolean;
  visibility: string;
  stateMutability: string;
}

export interface Ast {
  absolutePath: string;
  id?: number;
  nodeType: string;
  src: string;
  nodes: AstNode[];
  license: string;
  exportedSymbols: { [key: string]: number[] };
}

export interface ImportDirectiveNode {
  nodeType: 'ImportDirective';
  absolutePath: string;
  file: string;
  symbolAliases: {
    foreign: {
      name: string;
      nodeType: 'Identifier';
    };
  }[];
}

export interface OutputType {
  name: string;
  type: string;
  baseType: string;
  indexed?: boolean;
}

export type AstNode = ImportDirectiveNode | FunctionDefinitionNode | ContractDefinitionNode | VariableDeclarationNode;

export interface BasicStateVariableOptions {
  setFunction: {
    functionName: string;
    paramType: string;
    paramName: string;
  };
  mockFunction: {
    functionName: string;
    paramType: string;
  };
  isInternal: boolean;
}

export interface MappingStateVariableOptions {
  setFunction: {
    functionName: string;
    keyTypes: string[];
    valueType: string;
  };
  mockFunction: {
    functionName: string;
    keyTypes: string[];
    valueType: string;
    baseType: string;
  };
  isInternal: boolean;
  isArray: boolean;
  isStructArray: boolean;
}

export interface ArrayStateVariableOptions {
  setFunction: {
    functionName: string;
    arrayType: string;
    paramName: string;
  };
  mockFunction: {
    functionName: string;
    arrayType: string;
    baseType: string;
  };
  isInternal: boolean;
  isStruct: boolean;
}

export interface StateVariablesOptions {
  basicStateVariables: BasicStateVariableOptions[];
  arrayStateVariables: ArrayStateVariableOptions[];
  mappingStateVariables: MappingStateVariableOptions[];
}

export interface ExternalFunctionOptions {
  functionName: string;
  arguments: string;
  signature: string;
  inputsStringNames: string;
  outputsStringNames: string;
  inputString: string;
  outputString: string;
  isInterface: boolean;
  stateMutabilityString: string;
  abstractAndVirtual: boolean;
  visibility: string;
}

export interface InternalFunctionOptions {
  functionName: string;
  arguments: string;
  signature: string;
  inputsStringNames: string;
  outputsStringNames: string;
  outputsTypesString: string;
  inputsString: string;
  outputsString: string;
}

export const memoryTypes = ['string', 'bytes', 'mapping'];

export const arrayRegex = /(\w+)\[\]/;
export const structRegex = /struct (\w+)/;
