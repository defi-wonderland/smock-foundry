import { FunctionDefinition, VariableDeclaration, ParameterList } from 'solc-typed-ast';

export function mockFunctionDefinition(mockFunctionDefinition: Partial<FunctionDefinition>): FunctionDefinition {
  return mockFunctionDefinition as FunctionDefinition;
}

export function mockParameterList(mockParameterList: Partial<ParameterList>): ParameterList {
  return mockParameterList as ParameterList;
}

export function mockVariableDeclaration(mockVariableDeclaration: Partial<VariableDeclaration>): VariableDeclaration {
  return mockVariableDeclaration as VariableDeclaration;
}
