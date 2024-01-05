import { Ast, ContractDefinitionNode, FunctionDefinitionNode, VariableDeclarationNode } from '../src/types';
import { expect } from 'chai';

/**
 * Fakes a function definition node
 * @param name The name of the function
 * @param kind The kind of the function
 * @param visibility The visibility of the function
 * @param stateMutability The state mutability of the function
 * @param virtual Whether the function is virtual or not
 * @param implemented Whether the function is implemented or not
 * @param parameters The parameters of the function
 * @param returnParameters The return parameters of the function
 * @returns The faked function definition node
 */
export function FakeFunction(name: string, kind: string, visibility: string, stateMutability: string, virtual: boolean, implemented: boolean, parameters: VariableDeclarationNode[], returnParameters: VariableDeclarationNode[]): FunctionDefinitionNode {
  return {
    nodeType: 'FunctionDefinition',
    name: name,
    kind: kind,
    parameters: {
      parameters: parameters,
    },
    returnParameters: {
      parameters: returnParameters,
    },
    visibility: visibility,
    stateMutability: stateMutability,
    virtual: virtual,
    implemented: implemented,
  };
}

/**
 * Fakes a parameter declaration node
 * @param name The name of the parameter
 * @param type The type of the parameter
 * @param storageLocation The storage location of the parameter
 * @returns The faked parameter declaration node
 */
export function FakeParameter(name: string, type: string, storageLocation?: string): VariableDeclarationNode {
  return {
    nodeType: 'VariableDeclaration',
    typeDescriptions: {
      typeString: type,
    },
    name: name,
    constant: false,
    mutability: 'mutable',
    visibility: 'internal',
    stateVariable: false,
    storageLocation: storageLocation ? storageLocation : 'default',
  };
}

/**
 * Fakes a variable declaration node of an elementary type
 * @param name The name of the elementary variable
 * @param type The type of the elementary variable
 * @param constant Whether the elementary variable is constant or not
 * @param mutability The mutability of the elementary variable
 * @param visibility The visibility of the elementary variable
 * @returns The faked variable declaration node of an elementary type
 */
export function FakeElementaryVariable(name: string, type: string, constant: boolean, mutability: string, visibility: string): VariableDeclarationNode {
  return {
    nodeType: 'VariableDeclaration',
    typeDescriptions: {
      typeString: type,
    },
    typeName: {
      nodeType: 'ElementaryTypeName',
    },
    name: name,
    constant: constant,
    mutability: mutability,
    visibility: visibility,
    stateVariable: true,
    storageLocation: 'default',
  };
}

/**
 * Fakes a variable declaration node of an array type
 * @param name The name of the array variable
 * @param baseType The base type of the array variable
 * @param visibility The visibility of the array variable
 * @returns The faked variable declaration node of an array type
 */
export function FakeArrayVariable(name: string, baseType: string, visibility: string): VariableDeclarationNode {
  return {
    nodeType: 'VariableDeclaration',
    typeDescriptions: {
      typeString: `${baseType}[]`,
    },
    typeName: {
      nodeType: 'ArrayTypeName',
      baseType: {
        typeDescriptions: {
          typeString: baseType,
        },
      },
    },
    name: name,
    constant: false,
    mutability: 'mutable',
    visibility: visibility,
    stateVariable: true,
    storageLocation: 'default',
  };
}

/**
 * Fakes a variable declaration node of a mapping type
 * @param name The name of the mapping variable
 * @param keyType The key type of the mapping variable
 * @param valueType The value type of the mapping variable
 * @param visibility The visibility of the mapping variable
 * @returns The faked variable declaration node of a mapping type
 */
export function FakeMappingVariable(name: string, keyType: string, valueType: string, visibility: string): VariableDeclarationNode {
  return {
    nodeType: 'VariableDeclaration',
    typeDescriptions: {
      typeString: `mapping(${keyType} => ${valueType})`,
    },
    typeName: {
      nodeType: 'Mapping',
      keyType: {
        typeDescriptions: {
          typeString: keyType,
        },
      },
      valueType: {
        typeDescriptions: {
          typeString: valueType,
        },
      },
    },
    name: name,
    constant: false,
    mutability: 'mutable',
    visibility: visibility,
    stateVariable: true,
    storageLocation: 'default',
  };
}

/**
 * Expects a contract to be defined
 * @param ast The AST to expect the contract in
 * @param name The name of the contract
 * @param kind The kind of the contract
 * @param abstract Whether the contract is abstract or not
 * @returns The contract definition node
 */
export const expectContract = (ast: Ast, name: string, kind: string, abstract: boolean): ContractDefinitionNode => {
  const contract = ast.nodes.find((node) => node.nodeType === 'ContractDefinition' && node.name === name) as ContractDefinitionNode; // node.canonicalName?
  expect(contract).to.not.be.undefined;
  expect(contract.contractKind).to.equal(kind);
  expect(contract.abstract).to.equal(abstract);
  return contract;
}

/**
 * Expects a function to be defined
 * @param contract The contract to expect the function in
 * @param name The name of the function
 * @param kind The kind of the function
 * @param arity The arity of the function
 * @param visibility The visibility of the function
 * @returns The function definition node
 */
export const expectFunction = (contract: ContractDefinitionNode, name: string, kind: string, visibility: string, arity: number): FunctionDefinitionNode => {
  const func = contract.nodes.find((node) => node.nodeType === 'FunctionDefinition' && node.name === name && node.kind === kind && node.parameters.parameters.length === arity) as FunctionDefinitionNode;
  expect(func).to.not.be.undefined;
  expect(func.visibility).to.equal(visibility);
  return func;
}

/**
 * Expects a function parameter to be defined
 * @param func The function to expect the parameter in
 * @param name The name of the parameter to expect
 * @param type The type of the parameter to expect
 * @param storageLocation The storage location of the parameter to expect
 * @returns The parameter declaration node
 */
export const expectParameter = (func: FunctionDefinitionNode, name: string, type: string, storageLocation?: string): VariableDeclarationNode => {
  const param = func.parameters.parameters.find((param) => param.name === name) as VariableDeclarationNode;
  expect(param).to.not.be.undefined;
  expect(param.typeDescriptions.typeString).to.equal(type);
  expect(param.storageLocation).to.equal(storageLocation ? storageLocation : 'default');
  return param;
};

/**
 * Expects a function return parameter to be defined
 * @param func The function to expect the return parameter in
 * @param name The name of the return parameter to expect
 * @param type The type of the return parameter to expect
 * @param storageLocation The storage location of the return parameter to expect
 * @returns The parameter declaration node
 */
export const expectReturnParameter = (func: FunctionDefinitionNode, name: string, type: string, storageLocation?: string): VariableDeclarationNode => {
  const returnParam = func.returnParameters.parameters.find((param) => param.name === name) as VariableDeclarationNode;
  expect(returnParam).to.not.be.undefined;
  expect(returnParam.typeDescriptions.typeString).to.equal(type);
  expect(returnParam.storageLocation).to.equal(storageLocation ? storageLocation : 'default');
  return returnParam;
};
