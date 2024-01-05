import { generateMockContracts } from '../../src/index';
import { Ast, ContractDefinitionNode } from '../../src/types';
import { expectContract, expectFunction, expectParameter } from '../test-utils';
import { resolve } from 'path';

describe('E2E: getStateVariables', () => {
  let contractNodes: { [name: string]: ContractDefinitionNode };
  before(async () => {
    // generate mock contracts
    const contractsDir = ['solidity/contracts', 'solidity/interfaces'];
    const compiledArtifactsDir = 'out';
    const generatedContractsDir = 'solidity/test/smock';
    const ignoreDir = [];
    await generateMockContracts(contractsDir, compiledArtifactsDir, generatedContractsDir, ignoreDir);

    const contractsNames = ['ContractTest', 'ContractD'];

    contractsNames.forEach((contractName: string) => {
      const mockName = `Mock${contractName}`;
      
      const compiledArtifactsPath = resolve(compiledArtifactsDir, `${mockName}.sol`, `${mockName}.json`);
      const ast = require(compiledArtifactsPath).ast as Ast;
      if (!ast) throw new Error(`AST for ${mockName} not found`);

      const contractNode = expectContract(ast, mockName, 'contract', false);

      contractNodes = { ...contractNodes, [mockName]: contractNode };
    });
  });

  it('MockContractTest must include setters for struct variables', async () => {
    const contractNode = contractNodes['MockContractTest'];

    expectFunction(contractNode, 'set_myStructVariable', 'function', 'public', 1);
  });

  it('MockContractTest must include setters for struct arrays', async () => {
    const contractNode = contractNodes['MockContractTest'];

    expectFunction(contractNode, 'set_myStructArray', 'function', 'public', 1);
  });

  it('MockContractTest must include setters for struct mappings', async () => {
    const contractNode = contractNodes['MockContractTest'];

    expectFunction(contractNode, 'set_uint256ToMyStruct', 'function', 'public', 2);
  });

  it('MockContractTest must include setters for struct array mappings', async () => {
    const contractNode = contractNodes['MockContractTest'];

    expectFunction(contractNode, 'set_uint256ToMyStructArray', 'function', 'public', 2);
  });

  it('MockContractTest must include setters for nested mappings', async () => {
    const contractNode = contractNodes['MockContractTest'];

    expectFunction(contractNode, 'set_uint256ToAddressToBytes32', 'function', 'public', 3);
  });

  it('MockContractD must include setters for internal variables', async () => {
    const contractNode = contractNodes['MockContractD'];

    const func = expectFunction(contractNode, 'set__internalUintVar', 'function', 'public', 1);

    expectParameter(func, '__internalUintVar', 'uint256');
  });
});
