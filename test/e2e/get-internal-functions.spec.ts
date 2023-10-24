// Write unit tests for the getInternalFunctions function here like the other tests.
import { expect } from 'chai';
import { ContractDefinitionNode, FunctionDefinitionNode } from '../../src/types';
import { generateMockContracts } from '../../src/index';
import { resolve } from 'path';

// We use the describe function to group together related tests
describe('getInternalMockFunctions', () => {
  // We use the beforeEach function to reset the contract node before each test
  let contractNodes: { [name: string]: ContractDefinitionNode };
  before(async () => {
    // generate mock contracts
    const contractsDir = 'solidity/contracts';
    const compiledArtifactsDir = 'out';
    const generatedContractsDir = 'solidity/test/mock-contracts';
    await generateMockContracts(contractsDir, compiledArtifactsDir, generatedContractsDir);

    const contractsNames = ['ContractD'];

    contractsNames.forEach((contractName: string) => {
      const mockName = `Mock${contractName}`;
      const compiledArtifactsPath = resolve(compiledArtifactsDir, `${mockName}.sol`, `${mockName}.json`);
      const ast = require(compiledArtifactsPath).ast;
      if (!ast) throw new Error(`AST for ${mockName} not found`);
      const contractNode = ast.nodes.find(
        (node) => node.nodeType === 'ContractDefinition' && node.canonicalName === mockName
      ) as ContractDefinitionNode;
      if (!contractNode || contractNode.abstract || contractNode.contractKind === 'library')
        throw new Error(`Contract ${mockName} not found`);

      contractNodes = { ...contractNodes, [mockName]: contractNode };
    });
  });

  // We use the it function to create a test
  it('contract D must include constructor', async () => {
    const contractNode = contractNodes['MockContractD'];
    const constructor = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.kind === 'constructor'
    ) as FunctionDefinitionNode;
    expect(constructor).to.not.be.undefined;

    const param1 = constructor.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');
  });

  it('MockContractD must include setting variable', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'set__internalUintVar'
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '__internalUintVar');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');
  });

  it('MockContractD must include mock call', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call__setInternalUintVar'
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const param2 = func.parameters.parameters.find((param) => param.name === '_return0');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('bool');

    const param3 = func.parameters.parameters.find((param) => param.name === '_return1');
    expect(param3).to.not.be.undefined;
    expect(param3?.typeDescriptions.typeString).to.equal('uint256');

    const param4 = func.parameters.parameters.find((param) => param.name === '_return2');
    expect(param4).to.not.be.undefined;
    expect(param4?.typeDescriptions.typeString).to.equal('string');
    expect(param4?.storageLocation).to.equal('memory');
  });

  it('MockContractD must include overriden internal func', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === '_setInternalUintVar'
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('internal');

    const param1 = func.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const return0 = func.returnParameters.parameters.find((param) => param.name === '_return0');
    expect(return0).to.not.be.undefined;
    expect(return0?.typeDescriptions.typeString).to.equal('bool');

    const return1 = func.returnParameters.parameters.find((param) => param.name === '_return1');
    expect(return1).to.not.be.undefined;
    expect(return1?.typeDescriptions.typeString).to.equal('uint256');

    const return2 = func.returnParameters.parameters.find((param) => param.name === '_return2');
    expect(return2).to.not.be.undefined;
    expect(return2?.typeDescriptions.typeString).to.equal('string');
    expect(return2?.storageLocation).to.equal('memory');
  });
});
