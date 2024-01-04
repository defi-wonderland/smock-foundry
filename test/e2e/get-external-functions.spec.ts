// Write e2e tests for the getExternalFunctions function here like the other tests.
import { generateMockContracts } from '../../src/index';
import { ContractDefinitionNode, FunctionDefinitionNode } from '../../src/types';
import { expect } from 'chai';
import { expectParameter, expectReturnParameter } from '../test-utils';
import { resolve } from 'path';

// We use the describe function to group together related tests
describe('E2E: getExternalMockFunctions', () => {
  // We use the beforeEach function to reset the contract node before each test
  let contractNodes: { [name: string]: ContractDefinitionNode };
  before(async () => {
    // generate mock contracts
    const contractsDir = ['solidity/contracts', 'solidity/interfaces'];
    const compiledArtifactsDir = 'out';
    const generatedContractsDir = 'solidity/test/smock';
    const ignoreDir = [];
    await generateMockContracts(contractsDir, compiledArtifactsDir, generatedContractsDir, ignoreDir);

    const contractsNames = ['ContractTest', 'IContractTest', 'ContractAbstract'];

    contractsNames.forEach((contractName: string) => {
      const mockName = `Mock${contractName}`;
      const compiledArtifactsPath = resolve(compiledArtifactsDir, `${mockName}.sol`, `${mockName}.json`);
      const ast = require(compiledArtifactsPath).ast;
      if (!ast) throw new Error(`AST for ${mockName} not found`);
      const contractNode = ast.nodes.find(
        (node) => node.nodeType === 'ContractDefinition' && node.canonicalName === mockName,
      ) as ContractDefinitionNode;
      if (!contractNode || contractNode.abstract || contractNode.contractKind === 'library') throw new Error(`Contract ${mockName} not found`);

      contractNodes = { ...contractNodes, [mockName]: contractNode };
    });
  });

  // We use the it function to create a test
  it('MockContractTest must include constructor', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const constructor = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.kind === 'constructor',
    ) as FunctionDefinitionNode;
    expect(constructor).to.not.be.undefined;

    expectParameter(constructor, '_uintVariable', 'uint256');
  });

  it('MockContractTest must include external function mock call', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call_setVariables' && node.parameters.parameters.length === 2,
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    expectParameter(func, '_newValue', 'uint256');
    expectParameter(func, '_result', 'bool');
  });

  it('MockIContractTest must include interface function', async () => {
    const contractNode = contractNodes['MockIContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'setVariables' && node.parameters.parameters.length === 8,
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    expectParameter(func, '_newValue', 'uint256');
    expectParameter(func, '_newString', 'string', 'memory');
    expectParameter(func, '_newBool', 'bool');
    expectParameter(func, '_newAddress', 'address');
    expectParameter(func, '_newBytes32', 'bytes32');
    expectParameter(func, '_addressArray', 'address[]', 'memory');
    expectParameter(func, '_uint256Array', 'uint256[]', 'memory');
    expectParameter(func, '_bytes32Array', 'bytes32[]', 'memory');

    expectReturnParameter(func, '_result', 'bool');
  });

  it('MockIContractTest must include external function mock call', async () => {
    const contractNode = contractNodes['MockIContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call_setVariables' && node.parameters.parameters.length === 3,
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    expectParameter(func, '_param0', 'uint256');
    expectParameter(func, '_param1', 'bool');
    expectParameter(func, '_returnParam0', 'bool');
  });

  it('MockContractAbstract must include constructor', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const constructor = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.kind === 'constructor',
    ) as FunctionDefinitionNode;
    expect(constructor).to.not.be.undefined;

    expectParameter(constructor, '_uintVariable', 'uint256');
  });

  it('MockContractAbstract must include unimplemented external function', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find((node) => node.nodeType === 'FunctionDefinition' && node.name === 'undefinedFunc') as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    expectParameter(func, '_someText', 'string', 'memory');

    expectReturnParameter(func, '_result', 'bool');
  });

  it('MockContractAbstract must include unimplemented external function mock call', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call_undefinedFunc',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    expectParameter(func, '_someText', 'string', 'memory');
    expectParameter(func, '_result', 'bool');
  });
});
