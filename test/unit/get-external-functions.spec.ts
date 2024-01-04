// Write unit tests for the getExternalFunctions function here like the other tests.
import { getExternalMockFunctions } from '../../src/get-external-functions';
import { ContractDefinitionNode, ExternalFunctionOptions } from '../../src/types';
import { expect } from 'chai';
import { FakeFunction, FakeParameter } from '../test-utils';

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
    contractNode.nodes = [FakeFunction('myFunction', 'function', 'internal', 'nonpayable', false, true, [], []), FakeFunction('myFunction2', 'function', 'private', 'nonpayable', false, true, [], [])];
    const externalFunctions = getExternalMockFunctions(contractNode);
    expect(externalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return an empty array if the function is not a function kind', async () => {
    contractNode.nodes = [FakeFunction('myFunction', 'constructor', 'public', 'nonpayable', false, true, [], [])];
    const externalFunctions = getExternalMockFunctions(contractNode);
    expect(externalFunctions).to.be.an('array').that.is.empty;
  });

  it('should return the correct function data when storage location param is memory or calldata', async () => {
    contractNode.nodes = [FakeFunction('myFunction', 'function', 'public', 'view', false, true, [FakeParameter('_param', 'string', 'memory'), FakeParameter('_param2', 'string', 'calldata')], [])];
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
    contractNode.nodes = [FakeFunction('myFunction', 'function', 'public', 'nonpayable', false, true, [FakeParameter('_param', 'contract IERC20'), FakeParameter('_param2', 'struct MyStruct'), FakeParameter('_param3', 'enum MyEnum')], [])];
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
    contractNode.nodes = [FakeFunction('myFunction', 'function', 'public', 'nonpayable', false, true, [], [FakeParameter('_param', 'string', 'memory'), FakeParameter('_param2', 'string', 'calldata')])];
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
    contractNode.nodes = [FakeFunction('myFunction', 'function', 'public', 'nonpayable', false, true, [], [FakeParameter('_param', 'contract IERC20'), FakeParameter('_param2', 'struct MyStruct'), FakeParameter('_param3', 'enum MyEnum')])];
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
    contractNode.nodes = [FakeFunction('myFunction', 'function', 'public', 'nonpayable', false, true, [FakeParameter('_param', 'string', 'memory')], [FakeParameter('_output', 'string', 'memory')])];
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

    contractNode.nodes = [FakeFunction('myFunction', 'function', 'external', 'nonpayable', false, false, [FakeParameter('_param', 'string', 'memory')], [FakeParameter('_output', 'string', 'memory')])];
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

    contractNode.nodes = [FakeFunction('myFunction', 'function', 'public', 'nonpayable', true, false, [FakeParameter('_param', 'string', 'memory')], [FakeParameter('_output', 'string', 'memory')])];
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
