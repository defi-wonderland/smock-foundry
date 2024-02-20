import { ContractDefinitionNode } from '../../src/types';
import { expect } from 'chai';
import { FakeFunction, FakeParameter } from '../test-utils';

describe('getConstructor', () => {
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
  
  // it('should return undefined if there are no functions', async () => {
  //   const constructorSignature = getConstructor(contractNode);
  //   expect(constructorSignature).to.be.undefined;
  // });

  // it('should return undefined if there is no constructor', async () => {
  //   contractNode.nodes = [FakeFunction('myFunction', 'function', 'public', 'nonpayable', false, true, [], [])];
  //   const constructorSignature = getConstructor(contractNode);
  //   expect(constructorSignature).to.be.undefined;
  // });

  // it('should return the correct signature when storage location param is memory', async () => {
  //   contractNode.nodes = [FakeFunction('', 'constructor', 'public', 'nonpayable', false, true, [FakeParameter('_greeting', 'string', 'memory')], [])];
  //   const constructorSignature = getConstructor(contractNode);
  //   expect(constructorSignature).to.equal('constructor(string memory _greeting) MyContract(_greeting) {}');
  // });

  // it('should return the correct signature when storage location param is calldata', async () => {
  //   contractNode.nodes = [FakeFunction('', 'constructor', 'public', 'nonpayable', false, true, [FakeParameter('_greeting', 'string', 'calldata')], [])];
  //   const constructorSignature = getConstructor(contractNode);
  //   expect(constructorSignature).to.equal('constructor(string calldata _greeting) MyContract(_greeting) {}');
  // });

  // it('should return the correct signature when param is a contract', async () => {
  //   contractNode.nodes = [FakeFunction('', 'constructor', 'public', 'nonpayable', false, true, [FakeParameter('_token', 'contract IERC20')], [])];
  //   const constructorSignature = getConstructor(contractNode);
  //   expect(constructorSignature).to.equal('constructor(IERC20 _token) MyContract(_token) {}');
  // });

  // it('should return the correct signature when param is a struct', async () => {
  //   contractNode.nodes = [FakeFunction('', 'constructor', 'public', 'nonpayable', false, true, [FakeParameter('_myStruct', 'struct MyStruct', 'memory')], [])];
  //   const constructorSignature = getConstructor(contractNode);
  //   expect(constructorSignature).to.equal('constructor(MyStruct memory _myStruct) MyContract(_myStruct) {}');
  // });

  // it('should return the correct signature when param is an enum', async () => {
  //   contractNode.nodes = [FakeFunction('', 'constructor', 'public', 'nonpayable', false, true, [FakeParameter('_myEnum', 'enum MyEnum', 'memory')], [])];
  //   const constructorSignature = getConstructor(contractNode);
  //   expect(constructorSignature).to.equal('constructor(MyEnum memory _myEnum) MyContract(_myEnum) {}');
  // });
});
