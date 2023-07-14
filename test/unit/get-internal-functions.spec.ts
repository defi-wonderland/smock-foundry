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
        virtual: false,
        visibility: 'external',
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
        virtual: false,
        visibility: 'private',
      },
    ];
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
        virtual: false,
        visibility: 'public',
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    expect(internalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return the correct function data when storage location param is memory or calldata', async () => {
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
        virtual: true,
        visibility: 'internal',
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        arguments: 'string memory _param1, string calldata _param2',
        signature: 'myFunction(string,string)',
        inputsStringNames: '_param1, _param2',
        inputsString: 'string memory _param1, string calldata _param2',
        outputsString: '',
        outputsTypesString: '',
        outputsStringNames: '',
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
  });

  it('should return empty array if function is not virtual', async () => {
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
        virtual: false,
        visibility: 'internal',
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    expect(internalFunctions).to.be.empty;
  });

  it('should return the correct function data when param type is contract/struct/enum', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [
            FakeParameter(1, 'contract IERC20', ''),
            FakeParameter(2, 'struct MyStruct', ''),
            FakeParameter(3, 'enum MyEnum', ''),
          ],
        },
        returnParameters: {
          parameters: [],
        },
        virtual: true,
        visibility: 'internal',
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        arguments: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        signature: 'myFunction(IERC20,MyStruct,MyEnum)',
        inputsStringNames: '_param1, _param2, _param3',
        inputsString: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        outputsString: '',
        outputsTypesString: '',
        outputsStringNames: '',
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
        virtual: true,
        visibility: 'internal',
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        arguments: 'string memory _param1, string calldata _param2',
        signature: 'myFunction()',
        inputsStringNames: '',
        outputsStringNames: '_param1, _param2',
        inputsString: '',
        outputsString: 'string memory _param1, string calldata _param2',
        outputsTypesString: 'string, string',
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
          parameters: [
            FakeParameter(1, 'contract IERC20', ''),
            FakeParameter(2, 'struct MyStruct', ''),
            FakeParameter(3, 'enum MyEnum', ''),
          ],
        },
        virtual: true,
        visibility: 'internal',
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        arguments: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        signature: 'myFunction()',
        inputsStringNames: '',
        outputsStringNames: '_param1, _param2, _param3',
        inputsString: '',
        outputsString: 'IERC20 _param1, MyStruct _param2, MyEnum _param3',
        outputsTypesString: 'IERC20, MyStruct, MyEnum',
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
  });

  it('should return the correct function data when there are both params and outputs', async () => {
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
        virtual: true,
        visibility: 'internal',
      },
    ];
    const internalFunctions = getInternalMockFunctions(contractNode);
    const expectedData: InternalFunctionOptions[] = [
      {
        functionName: 'myFunction',
        arguments: 'string memory _param1, string memory _param2',
        signature: 'myFunction(string)',
        inputsStringNames: '_param1',
        outputsStringNames: '_param2',
        inputsString: 'string memory _param1',
        outputsString: 'string memory _param2',
        outputsTypesString: 'string',
      },
    ];
    expect(internalFunctions).to.be.an('array').that.is.not.empty;
    expect(internalFunctions).to.deep.equal(expectedData);
  });
});
