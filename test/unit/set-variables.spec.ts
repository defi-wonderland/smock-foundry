// Write unit tests for the getExternalFunctions function here like the other tests.
import { getStateVariables } from '../../src/get-variables-functions';
import { expect } from 'chai';
import { ContractDefinitionNode, StateVariablesOptions } from '../../src/types';

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
    contractNode.nodes = [
      {
        constant: false,
        mutability: 'mutable',
        visibility: 'public',
        name: 'myStructVariable',
        nodeType: 'VariableDeclaration',
        typeDescriptions: {
          typeString: 'struct MyStruct',
        },
      },
    ];
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
    contractNode.nodes = [
      {
        constant: false,
        mutability: 'mutable',
        visibility: 'public',
        name: 'myEnumVariable',
        nodeType: 'VariableDeclaration',
        typeDescriptions: {
          typeString: 'enum MyEnum',
        },
      },
    ];
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
    contractNode.nodes = [
      {
        constant: false,
        mutability: 'mutable',
        visibility: 'public',
        name: 'myContractVariable',
        nodeType: 'VariableDeclaration',
        typeDescriptions: {
          typeString: 'contract MyContract',
        },
      },
    ];
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

  it('should return the correct data if the variable is a mapping', async () => {
    contractNode.nodes = [
      {
        constant: false,
        mutability: 'mutable',
        visibility: 'public',
        name: 'uint256ToAddress',
        nodeType: 'VariableDeclaration',
        typeDescriptions: {
          typeString: 'mapping(uint256 => address)',
        },
        typeName: {
          keyType: {
            typeDescriptions: {
              typeString: 'uint256',
            },
          },
          valueType: {
            typeDescriptions: {
              typeString: 'address',
            },
          },
        },
      },
    ];
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
        },
      ],
    };
    expect(mappingStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is an array mapping', async () => {
    contractNode.nodes = [
      {
        constant: false,
        mutability: 'mutable',
        visibility: 'public',
        name: 'uint256ToAddressArray',
        nodeType: 'VariableDeclaration',
        typeDescriptions: {
          typeString: 'mapping(uint256 => address[])',
        },
        typeName: {
          keyType: {
            typeDescriptions: {
              typeString: 'uint256',
            },
          },
          valueType: {
            typeDescriptions: {
              typeString: 'address[]',
            },
            baseType: {
              typeDescriptions: {
                typeString: 'address',
              },
            },
          },
        },
      },
    ];
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
        },
      ],
    };
    expect(mappingStateVariable).to.deep.equal(expectedData);
  });

  it('should return the correct data if the variable is a nested mapping', async () => {
    contractNode.nodes = [
      {
        constant: false,
        mutability: 'mutable',
        visibility: 'public',
        name: 'uint256ToAddressToBytes32',
        nodeType: 'VariableDeclaration',
        typeDescriptions: {
          typeString: 'mapping(uint256 => mapping(address => bytes32))',
        },
        typeName: {
          keyType: {
            typeDescriptions: {
              typeString: 'uint256',
            },
          },
          valueType: {
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
          },
        },
      },
    ];
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
        },
      ],
    };
    expect(mappingStateVariable).to.deep.equal(expectedData);
  });
});
