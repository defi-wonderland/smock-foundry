import { expect } from 'chai';
import { ContractDefinitionNode, FunctionDefinitionNode } from '../../src/types';
import { generateMockContracts } from '../../src/index';
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
      const ast = require(compiledArtifactsPath).ast;
      if (!ast) throw new Error(`AST for ${mockName} not found`);
      const contractNode = ast.nodes.find(
        (node) => node.nodeType === 'ContractDefinition' && node.canonicalName === mockName,
      ) as ContractDefinitionNode;
      if (!contractNode || contractNode.abstract || contractNode.contractKind === 'library') throw new Error(`Contract ${mockName} not found`);

      contractNodes = { ...contractNodes, [mockName]: contractNode };
    });
  });

  it('MockContractTest must include setters for struct variables', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'set_myStructVariable',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');
  });

  it('MockContractTest must include setters for struct arrays', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'set_myStructArray',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');
  });

  it('MockContractTest must include setters for struct mappings', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'set_uint256ToMyStruct',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');
  });

  it('MockContractTest must include setters for struct array mappings', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'set_uint256ToMyStructArray',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');
  });

  it('MockContractTest must include setters for nested mappings', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'set_uint256ToAddressToBytes32',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');
  });

  it('MockContractD must include setters for internal variables', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'set__internalUintVar',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '__internalUintVar');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');
  });
});
