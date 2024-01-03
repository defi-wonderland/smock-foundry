// Write unit tests for the getExternalFunctions function here like the other tests.
import { getExternalMockFunctions } from '../../src/get-external-functions';
import { expect } from 'chai';
import { ContractDefinitionNode, ExternalFunctionOptions } from '../../src/types';

// We use the describe function to group together related tests
describe('getExternalMockFunctions', () => {
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
  it('should return an empty array if there are no functions', async () => {
    const externalFunctions = getExternalMockFunctions(contractNode);
    expect(externalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return an empty array if there are no external functions', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
      {
        name: 'myFunction2',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'private',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    expect(externalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return an empty array if the function is not a function kind', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'constructor',
        parameters: {
          parameters: [],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'public',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    expect(externalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return the correct function data when storage location param is memory or calldata', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [
            {
              name: '_param',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
            {
              name: '_param2',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'calldata',
            },
          ],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'public',
        stateMutability: 'view',
        virtual: false,
        implemented: true,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    const expectedData: ExternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string,string)',
        parameters: 'string memory _param, string calldata _param2',
        inputs: 'string memory _param, string calldata _param2',
        outputs: '',
        inputNames: ['_param', '_param2'],
        outputNames: [],
        visibility: 'public',
        stateMutability: ' view ',
        implemented: true,
      },
    ];
    expect(externalFunctions).to.be.an('array').that.is.not.empty;
    expect(externalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when param type is contract/struct/enum', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [
            {
              name: '_param',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'contract IERC20',
              },
              storageLocation: '',
            },
            {
              name: '_param2',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'struct MyStruct',
              },
              storageLocation: '',
            },
            {
              name: '_param3',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'enum MyEnum',
              },
              storageLocation: '',
            },
          ],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'public',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    const expectedData: ExternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(IERC20,MyStruct,MyEnum)',
        parameters: 'IERC20 _param, MyStruct _param2, MyEnum _param3',
        inputs: 'IERC20 _param, MyStruct _param2, MyEnum _param3',
        outputs: '',
        inputNames: ['_param', '_param2', '_param3'],
        outputNames: [],
        visibility: 'public',
        stateMutability: ' ',
        implemented: true,
      },
    ];
    expect(externalFunctions).to.be.an('array').that.is.not.empty;
    expect(externalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when the output storage location is memory or calldata', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [],
        },
        returnParameters: {
          parameters: [
            {
              name: '_param',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
            {
              name: '_param2',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'calldata',
            },
          ],
        },
        visibility: 'public',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    const expectedData: ExternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction()',
        parameters: 'string memory _param, string calldata _param2',
        inputs: '',
        outputs: 'string memory _param, string calldata _param2',
        inputNames: [],
        outputNames: ['_param', '_param2'],
        visibility: 'public',
        stateMutability: ' ',
        implemented: true,
      },
    ];
    expect(externalFunctions).to.be.an('array').that.is.not.empty;
    expect(externalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when the output type is contract/struct/enum', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [],
        },
        returnParameters: {
          parameters: [
            {
              name: '_param',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'contract IERC20',
              },
              storageLocation: '',
            },
            {
              name: '_param2',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'struct MyStruct',
              },
              storageLocation: '',
            },
            {
              name: '_param3',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'enum MyEnum',
              },
              storageLocation: '',
            },
          ],
        },
        visibility: 'public',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    const expectedData: ExternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction()',
        parameters: 'IERC20 _param, MyStruct _param2, MyEnum _param3',
        inputs: '',
        outputs: 'IERC20 _param, MyStruct _param2, MyEnum _param3',
        inputNames: [],
        outputNames: ['_param', '_param2', '_param3'],
        visibility: 'public',
        stateMutability: ' ',
        implemented: true,
      },
    ];
    expect(externalFunctions).to.be.an('array').that.is.not.empty;
    expect(externalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when there are both params and outputs', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [
            {
              name: '_param',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
          ],
        },
        returnParameters: {
          parameters: [
            {
              name: '_output',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
          ],
        },
        visibility: 'public',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    const expectedData: ExternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string)',
        parameters: 'string memory _param, string memory _output',
        inputs: 'string memory _param',
        outputs: 'string memory _output',
        inputNames: ['_param'],
        outputNames: ['_output'],
        visibility: 'public',
        stateMutability: ' ',
        implemented: true,
      },
    ];
    expect(externalFunctions).to.be.an('array').that.is.not.empty;
    expect(externalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data if the contract is interface', async () => {
    contractNode = {
      nodeType: 'ContractDefinition',
      canonicalName: 'MyContract',
      nodes: [],
      abstract: false,
      contractKind: 'interface',
      name: 'MyContract',
    };

    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [
            {
              name: '_param',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
          ],
        },
        returnParameters: {
          parameters: [
            {
              name: '_output',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
          ],
        },
        visibility: 'external',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: false,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    const expectedData: ExternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string)',
        parameters: 'string memory _param, string memory _output',
        inputs: 'string memory _param',
        outputs: 'string memory _output',
        inputNames: ['_param'],
        outputNames: ['_output'],
        visibility: 'external',
        stateMutability: ' ',
        implemented: false,
      },
    ];
    expect(externalFunctions).to.be.an('array').that.is.not.empty;
    expect(externalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data if the contract is abstract', async () => {
    contractNode = {
      nodeType: 'ContractDefinition',
      canonicalName: 'MyContract',
      nodes: [],
      abstract: true,
      contractKind: 'contract',
      name: 'MyContract',
    };

    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [
            {
              name: '_param',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
          ],
        },
        returnParameters: {
          parameters: [
            {
              name: '_output',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            },
          ],
        },
        visibility: 'public',
        stateMutability: 'nonpayable',
        virtual: true,
        implemented: false,
      },
    ];
    const externalFunctions = getExternalMockFunctions(contractNode);
    const expectedData: ExternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string)',
        parameters: 'string memory _param, string memory _output',
        inputs: 'string memory _param',
        outputs: 'string memory _output',
        inputNames: ['_param'],
        outputNames: ['_output'],
        visibility: 'public',
        stateMutability: ' ',
        implemented: false,
      },
    ];
    expect(externalFunctions).to.be.an('array').that.is.not.empty;
    expect(externalFunctions).to.deep.equal(expectedData);
  });
});
