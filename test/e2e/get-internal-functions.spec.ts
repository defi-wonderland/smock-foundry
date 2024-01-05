// Write e2e tests for the getInternalFunctions function here like the other tests.
import { generateMockContracts } from '../../src/index';
import { Ast, ContractDefinitionNode } from '../../src/types';
import { expectContract, expectFunction, expectParameter, expectReturnParameter } from '../test-utils';
import { resolve } from 'path';

// We use the describe function to group together related tests
describe('E2E: getInternalMockFunctions', () => {
  // We use the beforeEach function to reset the contract node before each test
  let contractNodes: { [name: string]: ContractDefinitionNode };
  before(async () => {
    // generate mock contracts
    const contractsDir = ['solidity/contracts', 'solidity/interfaces'];
    const compiledArtifactsDir = 'out';
    const generatedContractsDir = 'solidity/test/smock';
    const ignoreDir = [];
    await generateMockContracts(contractsDir, compiledArtifactsDir, generatedContractsDir, ignoreDir);

    const contractsNames = ['ContractD', 'ContractAbstract'];

    contractsNames.forEach((contractName: string) => {
      const mockName = `Mock${contractName}`;
      
      const compiledArtifactsPath = resolve(compiledArtifactsDir, `${mockName}.sol`, `${mockName}.json`);
      const ast = require(compiledArtifactsPath).ast as Ast;
      if (!ast) throw new Error(`AST for ${mockName} not found`);

      const contractNode = expectContract(ast, mockName, 'contract', false);

      contractNodes = { ...contractNodes, [mockName]: contractNode };
    });
  });

  // We use the it function to create a test
  it('MockContractD must include internal function mock call', async () => {
    const contractNode = contractNodes['MockContractD'];

    const func = expectFunction(contractNode, 'mock_call__setInternalUintVar', 'function', 'public', 4);

    expectParameter(func, '_uintVariable', 'uint256');
    expectParameter(func, '_returnParam0', 'bool');
    expectParameter(func, '_returnParam1', 'uint256');
    expectParameter(func, '_returnParam2', 'string', 'memory');
  });

  it('MockContractD must include internal function override', async () => {
    const contractNode = contractNodes['MockContractD'];

    const func = expectFunction(contractNode, '_setInternalUintVar', 'function', 'internal', 1);

    expectParameter(func, '_uintVariable', 'uint256');

    expectReturnParameter(func, '_returnParam0', 'bool');
    expectReturnParameter(func, '_returnParam1', 'uint256');
    expectReturnParameter(func, '_returnParam2', 'string', 'memory');
  });

  it('MockContractD must include internal view function mock call', async () => {
    const contractNode = contractNodes['MockContractD'];

    const func = expectFunction(contractNode, 'mock_call__getVariables', 'function', 'public', 4);

    expectParameter(func, '_uintVariable', 'uint256');
    expectParameter(func, '_returnParam0', 'bool');
    expectParameter(func, '_returnParam1', 'uint256');
    expectParameter(func, '_returnParam2', 'string', 'memory');
  });

  it('MockContractD must include internal view function override', async () => {
    const contractNode = contractNodes['MockContractD'];

    const func = expectFunction(contractNode, '_getVariables', 'function', 'internal', 1);

    expectParameter(func, '_uintVariable', 'uint256');

    expectReturnParameter(func, '_returnParam0', 'bool');
    expectReturnParameter(func, '_returnParam1', 'uint256');
    expectReturnParameter(func, '_returnParam2', 'string', 'memory');
  });

  it('MockContractAbstract must include unimplemented internal function mock call', async () => {
    const contractNode = contractNodes['MockContractAbstract'];

    const func = expectFunction(contractNode, 'mock_call__undefinedInternalFunc', 'function', 'public', 2);

    expectParameter(func, '_someText', 'string', 'memory');
    expectParameter(func, '_result', 'bool');
  });

  it('MockContractAbstract must include unimplemented internal function override', async () => {
    const contractNode = contractNodes['MockContractAbstract'];

    const func = expectFunction(contractNode, '_undefinedInternalFunc', 'function', 'internal', 1);

    expectParameter(func, '_someText', 'string', 'memory');

    expectReturnParameter(func, '_result', 'bool');
  });

  it('MockContractAbstract must include unimplemented internal view function mock call', async () => {
    const contractNode = contractNodes['MockContractAbstract'];

    const func = expectFunction(contractNode, 'mock_call__undefinedInternalViewFunc', 'function', 'public', 2);

    expectParameter(func, '_someText', 'string', 'memory');
    expectParameter(func, '_result', 'bool');
  });

  it('MockContractAbstract must include unimplemented internal view function override', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    
    const func = expectFunction(contractNode, '_undefinedInternalViewFunc', 'function', 'internal', 1);

    expectParameter(func, '_someText', 'string', 'memory');

    expectReturnParameter(func, '_result', 'bool');
  });
});
