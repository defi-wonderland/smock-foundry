// Write unit tests for the getExternalFunctions function here like the other tests.
import { getStateVariables } from '../../src/get-variables-functions';
import { ContractDefinitionNode, VariableDeclarationNode, StateVariablesOptions } from '../../src/types';
import { expect } from 'chai';
import { FakeElementaryVariable, FakeArrayVariable, FakeMappingVariable } from '../test-utils';

// We use the describe function to group together related tests
describe('getStateVariables', () => {
  // We use the beforeEach function to reset the contract node before each test
  let contractNode: ContractDefinitionNode;
  beforeEach(() => {
    // Reset contract node
    contractNode = {
      nodeType: 'ContractDefinition',
      canonicalName: 'MyContract',
      nodes: [],
      abstract: false,
      contractKind: 'contract',
      name: 'MyContract',
    };
  });

  // We use the it function to create a test
  it('should return an empty array if there are no state variables', async () => {
    const stateVariables = getStateVariables(contractNode);
    const expectedData = {
      basicStateVariables: [],
      arrayStateVariables: [],
      mappingStateVariables: [],
    };
    expect(stateVariables).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a base struct', async () => {
    contractNode.nodes = [FakeElementaryVariable('myStructVariable', 'struct MyStruct', false, 'mutable', 'public')];
    const baseStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [
        {
          setFunction: {
            functionName: 'myStructVariable',
            paramType: 'MyStruct memory',
            paramName: 'myStructVariable',
          },
          mockFunction: {
            functionName: 'myStructVariable',
            paramType: 'MyStruct memory',
          },
          isInternal: false,
        },
      ],
      arrayStateVariables: [],
      mappingStateVariables: [],
    };
    expect(baseStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a base enum', async () => {
    contractNode.nodes = [FakeElementaryVariable('myEnumVariable', 'enum MyEnum', false, 'mutable', 'public')];
    const baseStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [
        {
          setFunction: {
            functionName: 'myEnumVariable',
            paramType: 'MyEnum',
            paramName: 'myEnumVariable',
          },
          mockFunction: {
            functionName: 'myEnumVariable',
            paramType: 'MyEnum',
          },
          isInternal: false,
        },
      ],
      arrayStateVariables: [],
      mappingStateVariables: [],
    };
    expect(baseStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a base contract', async () => {
    contractNode.nodes = [FakeElementaryVariable('myContractVariable', 'contract MyContract', false, 'mutable', 'public')];
    const baseStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [
        {
          setFunction: {
            functionName: 'myContractVariable',
            paramType: 'MyContract',
            paramName: 'myContractVariable',
          },
          mockFunction: {
            functionName: 'myContractVariable',
            paramType: 'MyContract',
          },
          isInternal: false,
        },
      ],
      arrayStateVariables: [],
      mappingStateVariables: [],
    };
    expect(baseStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is an array', async () => {
    contractNode.nodes = [FakeArrayVariable('addressArray', 'address', 'public')];
    const arrayStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [],
      arrayStateVariables: [
        {
          setFunction: {
            functionName: 'addressArray',
            arrayType: 'address[] memory',
            paramName: 'addressArray',
          },
          mockFunction: {
            functionName: 'addressArray',
            arrayType: 'address[] memory',
            baseType: 'address',
          },
          isInternal: false,
          isStruct: false,
        },
      ],
      mappingStateVariables: [],
    };
    expect(arrayStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a struct array', async () => {
    contractNode.nodes = [FakeArrayVariable('myStructArray', 'struct MyStruct', 'public')];
    const arrayStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [],
      arrayStateVariables: [
        {
          setFunction: {
            functionName: 'myStructArray',
            arrayType: 'MyStruct[] memory',
            paramName: 'myStructArray',
          },
          mockFunction: {
            functionName: 'myStructArray',
            arrayType: 'MyStruct[] memory',
            baseType: 'MyStruct memory',
          },
          isInternal: false,
          isStruct: true,
        },
      ],
      mappingStateVariables: [],
    };
    expect(arrayStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a mapping', async () => {
    contractNode.nodes = [FakeMappingVariable('uint256ToAddress', 'uint256', 'address', 'public')];
    const mappingStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [],
      arrayStateVariables: [],
      mappingStateVariables: [
        {
          setFunction: {
            functionName: 'uint256ToAddress',
            keyTypes: ['uint256'],
            valueType: 'address',
          },
          mockFunction: {
            functionName: 'uint256ToAddress',
            keyTypes: ['uint256'],
            valueType: 'address',
            baseType: 'address',
          },
          isInternal: false,
          isArray: false,
          isStructArray: false,
        },
      ],
    };
    expect(mappingStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is an array mapping', async () => {
    contractNode.nodes = [FakeMappingVariable('uint256ToAddressArray', 'uint256', 'address[]', 'public')];
    (contractNode.nodes[0] as VariableDeclarationNode).typeName!.valueType = {
      typeDescriptions: {
        typeString: 'address[]',
      },
      baseType: {
        typeDescriptions: {
          typeString: 'address',
        },
      },
    };
    const mappingStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [],
      arrayStateVariables: [],
      mappingStateVariables: [
        {
          setFunction: {
            functionName: 'uint256ToAddressArray',
            keyTypes: ['uint256'],
            valueType: 'address[] memory',
          },
          mockFunction: {
            functionName: 'uint256ToAddressArray',
            keyTypes: ['uint256'],
            valueType: 'address[] memory',
            baseType: 'address',
          },
          isInternal: false,
          isArray: true,
          isStructArray: false,
        },
      ],
    };
    expect(mappingStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a struct array mapping', async () => {
    contractNode.nodes = [FakeMappingVariable('uint256ToMyStructArray', 'uint256', 'struct MyStruct[]', 'public')];
    (contractNode.nodes[0] as VariableDeclarationNode).typeName!.valueType = {
      typeDescriptions: {
        typeString: 'struct MyStruct[]',
      },
      baseType: {
        typeDescriptions: {
          typeString: 'struct MyStruct',
        },
      },
    };
    const mappingStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [],
      arrayStateVariables: [],
      mappingStateVariables: [
        {
          setFunction: {
            functionName: 'uint256ToMyStructArray',
            keyTypes: ['uint256'],
            valueType: 'MyStruct[] memory',
          },
          mockFunction: {
            functionName: 'uint256ToMyStructArray',
            keyTypes: ['uint256'],
            valueType: 'MyStruct[] memory',
            baseType: 'MyStruct memory',
          },
          isInternal: false,
          isArray: true,
          isStructArray: true,
        },
      ],
    };
    expect(mappingStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a nested mapping', async () => {
    contractNode.nodes = [FakeMappingVariable('uint256ToAddressToBytes32', 'uint256', 'mapping(address => bytes32)', 'public')];
    (contractNode.nodes[0] as VariableDeclarationNode).typeName!.valueType = {
      typeDescriptions: {
        typeString: 'mapping(address => bytes32)',
      },
      keyType: {
        typeDescriptions: {
          typeString: 'address',
        },
      },
      valueType: {
        typeDescriptions: {
          typeString: 'bytes32',
        },
      },
    };
    const mappingStateVariable = getStateVariables(contractNode);
    const expectedData: StateVariablesOptions = {
      basicStateVariables: [],
      arrayStateVariables: [],
      mappingStateVariables: [
        {
          setFunction: {
            functionName: 'uint256ToAddressToBytes32',
            keyTypes: ['uint256', 'address'],
            valueType: 'bytes32',
          },
          mockFunction: {
            functionName: 'uint256ToAddressToBytes32',
            keyTypes: ['uint256', 'address'],
            valueType: 'bytes32',
            baseType: 'bytes32',
          },
          isInternal: false,
          isArray: false,
          isStructArray: false,
        },
      ],
    };
    expect(mappingStateVariable).to.deep.equal(expectedData);
  });
});
