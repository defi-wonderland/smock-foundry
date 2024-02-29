export const userDefinedTypes = ['contract', 'enum', 'struct'];
export const explicitTypes = ['string', 'bytes', 'mapping', 'struct'];

// Contexts to pass to Handlebars templates
export interface ConstructorContext {
  parameters: string;
  parameterNames: string;
  contractName: string;
}

export interface ExternalFunctionContext {
  functionName: string;
  signature: string;
  parameters: string;
  inputs: string;
  outputs: string;
  inputNames: string[];
  outputNames: string[];
  visibility: string;
  stateMutability: string;
  implemented: boolean;
}

export interface InternalFunctionContext extends Omit<ExternalFunctionContext, 'visibility' | 'stateMutability'> {
  inputTypes: string[];
  outputTypes: string[];
  isView: boolean;
}

export interface ImportContext {
  absolutePath: string;
  namedImports?: (string | number)[];
}

export interface MappingVariableContext {
  setFunction: {
    functionName: string,
    keyTypes: string[],
    valueType: string,
  },
  mockFunction: {
    functionName: string,
    keyTypes: string[],
    valueType: string,
    baseType: string,
  },
  isInternal: boolean,
  isArray: boolean,
  isStructArray: boolean,
}

export interface ArrayVariableContext {
  setFunction: {
    functionName: string,
    arrayType: string,
    paramName: string,
  };
  mockFunction: {
    functionName: string,
    arrayType: string,
    baseType: string,
  };
  isInternal: boolean;
  isStructArray: boolean;
}

export interface StateVariableContext {
  isInternal: boolean;
  setFunction: {
    functionName: string,
    paramType: string,
    paramName: string,
  };
  mockFunction: {
    functionName: string,
    paramType: string,
  };
}
