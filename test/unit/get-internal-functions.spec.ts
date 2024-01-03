// Write unit tests for the getInternalFunctions function here like the other tests.
import { getInternalMockFunctions } from '../../src/get-internal-functions';
import { expect } from 'chai';
import { ContractDefinitionNode, InternalFunctionOptions, VariableDeclarationNode } from '../../src/types';

function FakeParameter(n: number, type: string, storage: string): VariableDeclarationNode {
  return {
    name: `_param${n}`,
    nodeType: 'VariableDeclaration',
    constant: false,
    mutability: 'mutable',
    visibility: 'public',
    typeName: {
      keyType: {
        typeDescriptions: {
          typeString: type,
        },
      },
      valueType: {
        typeDescriptions: {
          typeString: type,
        },
      },
      baseType: {
        typeDescriptions: {
          typeString: type,
        },
      },
    },
    typeDescriptions: {
      typeString: type,
    },
    storageLocation: storage,
  };
}

// We use the describe function to group together related tests
describe('getInternalMockFunctions', () => {
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
    const internalFunctions = getInternalMockFunctions(contractNode);
    expect(internalFunctions).to.be.an('array').that.is.empty;
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
    const internalFunctions = getInternalMockFunctions(contractNode);
    expect(internalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return an empty array if there are no internal functions', async () => {
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
        visibility: 'external',
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
    const internalFunctions = getInternalMockFunctions(contractNode);
    expect(internalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return an empty array if the internal function is not virtual', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [FakeParameter(1, 'string', 'memory'), FakeParameter(2, 'string', 'calldata')],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: false,
        implemented: true,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    expect(internalFunctions).to.be.empty;
  });

  it('should return the correct function data when the input storage location is memory or calldata', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [FakeParameter(1, 'string', 'memory'), FakeParameter(2, 'string', 'calldata')],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: true,
        implemented: true,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string,string)',
        parameters: 'string memory _param1, string calldata _param2',
        inputs: 'string memory _param1, string calldata _param2',
        outputs: '',
        inputTypes: ['string', 'string'],
        outputTypes: [],
        inputNames: ['_param1', '_param2'],
        outputNames: [],
        isView: false,
        implemented: true,
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when the input type is contract/struct/enum', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [FakeParameter(1, 'contract IERC20', ''), FakeParameter(2, 'struct MyStruct', ''), FakeParameter(3, 'enum MyEnum', '')],
        },
        returnParameters: {
          parameters: [],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: true,
        implemented: true,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(IERC20,MyStruct,MyEnum)',
        parameters: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        inputs: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        outputs: '',
        inputTypes: ['IERC20', 'MyStruct', 'MyEnum'],
        outputTypes: [],
        inputNames: ['_param1', '_param2', '_param3'],
        outputNames: [],
        isView: false,
        implemented: true,
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
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
          parameters: [FakeParameter(1, 'string', 'memory'), FakeParameter(2, 'string', 'calldata')],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: true,
        implemented: true,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction()',
        parameters: 'string memory _param1, string calldata _param2',
        inputs: '',
        outputs: 'string memory _param1, string calldata _param2',
        inputTypes: [],
        outputTypes: ['string', 'string'],
        inputNames: [],
        outputNames: ['_param1', '_param2'],
        isView: false,
        implemented: true,
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
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
          parameters: [FakeParameter(1, 'contract IERC20', ''), FakeParameter(2, 'struct MyStruct', ''), FakeParameter(3, 'enum MyEnum', '')],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: true,
        implemented: true,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction()',
        parameters: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        inputs: '',
        outputs: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        inputTypes: [],
        outputTypes: ['IERC20', 'MyStruct', 'MyEnum'],
        inputNames: [],
        outputNames: ['_param1', '_param2', '_param3'],
        isView: false,
        implemented: true,
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when there are both inputs and outputs', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [FakeParameter(1, 'string', 'memory')],
        },
        returnParameters: {
          parameters: [FakeParameter(2, 'string', 'memory')],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: true,
        implemented: true,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string)',
        parameters: 'string memory _param1, string memory _param2',
        inputs: 'string memory _param1',
        outputs: 'string memory _param2',
        inputTypes: ['string'],
        outputTypes: ['string'],
        inputNames: ['_param1'],
        outputNames: ['_param2'],
        isView: false,
        implemented: true,
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when the state mutability is view', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [FakeParameter(1, 'string', 'memory')],
        },
        returnParameters: {
          parameters: [FakeParameter(2, 'string', 'memory')],
        },
        visibility: 'internal',
        stateMutability: 'view',
        virtual: true,
        implemented: true,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string)',
        parameters: 'string memory _param1, string memory _param2',
        inputs: 'string memory _param1',
        outputs: 'string memory _param2',
        inputTypes: ['string'],
        outputTypes: ['string'],
        inputNames: ['_param1'],
        outputNames: ['_param2'],
        isView: true,
        implemented: true,
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
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
          parameters: [FakeParameter(1, 'string', 'memory')],
        },
        returnParameters: {
          parameters: [FakeParameter(2, 'string', 'memory')],
        },
        visibility: 'internal',
        stateMutability: 'nonpayable',
        virtual: true,
        implemented: false,
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        signature: 'myFunction(string)',
        parameters: 'string memory _param1, string memory _param2',
        inputs: 'string memory _param1',
        outputs: 'string memory _param2',
        inputTypes: ['string'],
        outputTypes: ['string'],
        inputNames: ['_param1'],
        outputNames: ['_param2'],
        isView: false,
        implemented: false,
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
  });
});
