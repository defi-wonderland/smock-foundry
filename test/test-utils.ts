import { FunctionDefinitionNode, VariableDeclarationNode } from '../src/types';
import { expect } from 'chai';

/**
 * Fakes a function definition node
 * @param functionName The name of the function
 * @param kind The kind of the function
 * @param visibility The visibility of the function
 * @param stateMutability The state mutability of the function
 * @param virtual Whether the function is virtual or not
 * @param implemented Whether the function is implemented or not
 * @param parameters The parameters of the function
 * @param returnParameters The return parameters of the function
 * @returns The faked function definition node
 */
export function FakeFunction(functionName: string, kind: string, visibility: string, stateMutability: string, virtual: boolean, implemented: boolean, parameters: VariableDeclarationNode[], returnParameters: VariableDeclarationNode[]): FunctionDefinitionNode {
  return {
    nodeType: 'FunctionDefinition',
    name: functionName,
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
 * @param paramName The name of the parameter
 * @param type The type of the parameter
 * @param storageLocation The storage location of the parameter
 * @returns The faked parameter declaration node
 */
export function FakeParameter(paramName: string, type: string, storageLocation?: string): VariableDeclarationNode {
  return {
    nodeType: 'VariableDeclaration',
    typeDescriptions: {
      typeString: type,
    },
    name: paramName,
    constant: false,
    mutability: 'mutable',
    visibility: 'internal',
    stateVariable: false,
    storageLocation: storageLocation ? storageLocation : 'default',
  };
}

/**
 * Fakes a variable declaration node of an elementary type
 * @param variableName The name of the elementary variable
 * @param type The type of the elementary variable
 * @param constant Whether the elementary variable is constant or not
 * @param mutability The mutability of the elementary variable
 * @param visibility The visibility of the elementary variable
 * @returns The faked variable declaration node of an elementary type
 */
export function FakeElementaryVariable(variableName: string, type: string, constant: boolean, mutability: string, visibility: string): VariableDeclarationNode {
  return {
    nodeType: 'VariableDeclaration',
    typeDescriptions: {
      typeString: type,
    },
    typeName: {
      nodeType: 'ElementaryTypeName',
    },
    name: variableName,
    constant: constant,
    mutability: mutability,
    visibility: visibility,
    stateVariable: true,
    storageLocation: 'default',
  };
}

/**
 * Fakes a variable declaration node of an array type
 * @param variableName The name of the array variable
 * @param baseType The base type of the array variable
 * @param visibility The visibility of the array variable
 * @returns The faked variable declaration node of an array type
 */
export function FakeArrayVariable(variableName: string, baseType: string, visibility: string): VariableDeclarationNode {
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
    name: variableName,
    constant: false,
    mutability: 'mutable',
    visibility: visibility,
    stateVariable: true,
    storageLocation: 'default',
  };
}

/**
 * Fakes a variable declaration node of a mapping type
 * @param variableName The name of the mapping variable
 * @param keyType The key type of the mapping variable
 * @param valueType The value type of the mapping variable
 * @param visibility The visibility of the mapping variable
 * @returns The faked variable declaration node of a mapping type
 */
export function FakeMappingVariable(variableName: string, keyType: string, valueType: string, visibility: string): VariableDeclarationNode {
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
    name: variableName,
    constant: false,
    mutability: 'mutable',
    visibility: visibility,
    stateVariable: true,
    storageLocation: 'default',
  };
}

/**
 * Expects a function parameter to be defined
 * @param func The function to expect the parameter in
 * @param paramName The name of the parameter to expect
 * @param type The type of the parameter to expect
 * @param storageLocation The storage location of the parameter to expect
 */
export const expectParameter = (func: FunctionDefinitionNode, paramName: string, type: string, storageLocation?: string) => {
  const param = func.parameters.parameters.find((param) => param.name === paramName);
  expect(param).to.not.be.undefined;
  expect(param?.typeDescriptions.typeString).to.equal(type);
  expect(param?.storageLocation).to.equal(storageLocation ? storageLocation : 'default');
};

/**
 * Expects a function return parameter to be defined
 * @param func The function to expect the return parameter in
 * @param paramName The name of the return parameter to expect
 * @param type The type of the return parameter to expect
 * @param storageLocation The storage location of the return parameter to expect
 */
export const expectReturnParameter = (func: FunctionDefinitionNode, paramName: string, type: string, storageLocation?: string) => {
  const returnParam = func.returnParameters.parameters.find((param) => param.name === paramName);
  expect(returnParam).to.not.be.undefined;
  expect(returnParam?.typeDescriptions.typeString).to.equal(type);
  expect(returnParam?.storageLocation).to.equal(storageLocation ? storageLocation : 'default');
};
