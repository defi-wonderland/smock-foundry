export interface VariableDeclarationNode {
  constant?: boolean;
  mutability?: string;
  visibility?: string;
  name: string;
  nodeType: 'VariableDeclaration';
  storageLocation: string;
  typeDescriptions: {
    typeString: string;
  };
  typeName?: {
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
    baseType: {
      typeDescriptions: {
        typeString: string;
      };
    };
  };
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
    keyType: string;
    valueType: string;
    mappingName: string;
  };
  mockFunction: {
    functionName: string;
    keyType: string;
    valueType: string;
  };
  isInternal: boolean;
}

export interface ArrayStateVariableOptions {
  setFunction: {
    functionName: string;
    paramType: string;
    paramName: string;
  };
  mockFunction: {
    functionName: string;
    paramType: string;
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
}

export interface InternalFunctionOptions {
  functionName: string;
  arguments: string;
  signature: string;
  inputsStringNames: string;
  inputsString: string;
  outputsStringNames: string;
  outputsString: string;
  outputsTypesString: string;
}

export const memoryTypes = ['string', 'bytes', 'mapping'];

export const arrayRegex = /(\w+)\[\]/;
export const structRegex = /struct (\w+)/;
