// Write e2e tests for the getExternalFunctions function here like the other tests.
import { generateMockContracts } from '../../src/index';
import { Ast, ContractDefinitionNode } from '../../src/types';
import { expectContract, expectFunction, expectParameter, expectReturnParameter } from '../test-utils';
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
      const ast = require(compiledArtifactsPath).ast as Ast;
      if (!ast) throw new Error(`AST for ${mockName} not found`);

      const contractNode = expectContract(ast, mockName, 'contract', false);

      contractNodes = { ...contractNodes, [mockName]: contractNode };
    });
  });

  // We use the it function to create a test
  it('MockContractTest must include constructor', async () => {
    const contractNode = contractNodes['MockContractTest'];

    const constructor = expectFunction(contractNode, '', 'constructor', 'public', 5);

    expectParameter(constructor, '_uintVariable', 'uint256');
  });

  it('MockContractTest must include external function mock call', async () => {
    const contractNode = contractNodes['MockContractTest'];

    const func = expectFunction(contractNode, 'mock_call_setVariables', 'function', 'public', 2);

    expectParameter(func, '_newValue', 'uint256');
    expectParameter(func, '_result', 'bool');
  });

  it('MockIContractTest must include interface function', async () => {
    const contractNode = contractNodes['MockIContractTest'];

    const func = expectFunction(contractNode, 'setVariables', 'function', 'external', 8);

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

    const func = expectFunction(contractNode, 'mock_call_setVariables', 'function', 'public', 3);

    expectParameter(func, '_param0', 'uint256');
    expectParameter(func, '_param1', 'bool');
    expectParameter(func, '_returnParam0', 'bool');
  });

  it('MockContractAbstract must include constructor', async () => {
    const contractNode = contractNodes['MockContractAbstract'];

    const constructor = expectFunction(contractNode, '', 'constructor', 'public', 1);

    expectParameter(constructor, '_uintVariable', 'uint256');
  });

  it('MockContractAbstract must include unimplemented external function', async () => {
    const contractNode = contractNodes['MockContractAbstract'];

    const func = expectFunction(contractNode, 'undefinedFunc', 'function', 'public', 1);

    expectParameter(func, '_someText', 'string', 'memory');

    expectReturnParameter(func, '_result', 'bool');
  });

  it('MockContractAbstract must include unimplemented external function mock call', async () => {
    const contractNode = contractNodes['MockContractAbstract'];

    const func = expectFunction(contractNode, 'mock_call_undefinedFunc', 'function', 'public', 2);

    expectParameter(func, '_someText', 'string', 'memory');
    expectParameter(func, '_result', 'bool');
  });
});
