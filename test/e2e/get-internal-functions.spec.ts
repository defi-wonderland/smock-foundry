// Write e2e tests for the getInternalFunctions function here like the other tests.
import { expect } from 'chai';
import { ContractDefinitionNode, FunctionDefinitionNode } from '../../src/types';
import { generateMockContracts } from '../../src/index';
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
  it('MockContractD must include internal function mock call', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call__setInternalUintVar',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const param2 = func.parameters.parameters.find((param) => param.name === '_returnParam0');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('bool');

    const param3 = func.parameters.parameters.find((param) => param.name === '_returnParam1');
    expect(param3).to.not.be.undefined;
    expect(param3?.typeDescriptions.typeString).to.equal('uint256');

    const param4 = func.parameters.parameters.find((param) => param.name === '_returnParam2');
    expect(param4).to.not.be.undefined;
    expect(param4?.typeDescriptions.typeString).to.equal('string');
    expect(param4?.storageLocation).to.equal('memory');
  });

  it('MockContractD must include internal function override', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === '_setInternalUintVar',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    const param1 = func.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const returnParam1 = func.returnParameters.parameters.find((param) => param.name === '_returnParam0');
    expect(returnParam1).to.not.be.undefined;
    expect(returnParam1?.typeDescriptions.typeString).to.equal('bool');

    const returnParam2 = func.returnParameters.parameters.find((param) => param.name === '_returnParam1');
    expect(returnParam2).to.not.be.undefined;
    expect(returnParam2?.typeDescriptions.typeString).to.equal('uint256');

    const returnParam3 = func.returnParameters.parameters.find((param) => param.name === '_returnParam2');
    expect(returnParam3).to.not.be.undefined;
    expect(returnParam3?.typeDescriptions.typeString).to.equal('string');
    expect(returnParam3?.storageLocation).to.equal('memory');
  });

  it('MockContractD must include internal view function mock call', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call__getVariables',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const param2 = func.parameters.parameters.find((param) => param.name === '_returnParam0');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('bool');

    const param3 = func.parameters.parameters.find((param) => param.name === '_returnParam1');
    expect(param3).to.not.be.undefined;
    expect(param3?.typeDescriptions.typeString).to.equal('uint256');

    const param4 = func.parameters.parameters.find((param) => param.name === '_returnParam2');
    expect(param4).to.not.be.undefined;
    expect(param4?.typeDescriptions.typeString).to.equal('string');
    expect(param4?.storageLocation).to.equal('memory');
  });

  it('MockContractD must include internal view function override', async () => {
    const contractNode = contractNodes['MockContractD'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === '_getVariables',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    const param1 = func.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const returnParam1 = func.returnParameters.parameters.find((param) => param.name === '_returnParam0');
    expect(returnParam1).to.not.be.undefined;
    expect(returnParam1?.typeDescriptions.typeString).to.equal('bool');

    const returnParam2 = func.returnParameters.parameters.find((param) => param.name === '_returnParam1');
    expect(returnParam2).to.not.be.undefined;
    expect(returnParam2?.typeDescriptions.typeString).to.equal('uint256');

    const returnParam3 = func.returnParameters.parameters.find((param) => param.name === '_returnParam2');
    expect(returnParam3).to.not.be.undefined;
    expect(returnParam3?.typeDescriptions.typeString).to.equal('string');
    expect(returnParam3?.storageLocation).to.equal('memory');
  });

  it('MockContractAbstract must include unimplemented internal function mock call', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call__undefinedInternalFunc',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '_someText');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('string');
    expect(param1?.storageLocation).to.equal('memory');

    const param2 = func.parameters.parameters.find((param) => param.name === '_result');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('bool');
  });

  it('MockContractAbstract must include unimplemented internal function override', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === '_undefinedInternalFunc',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    const param1 = func.parameters.parameters.find((param) => param.name === '_someText');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('string');
    expect(param1?.storageLocation).to.equal('memory');

    const returnParam1 = func.returnParameters.parameters.find((param) => param.name === '_result');
    expect(returnParam1).to.not.be.undefined;
    expect(returnParam1?.typeDescriptions.typeString).to.equal('bool');
  });

  it('MockContractAbstract must include unimplemented internal view function mock call', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call__undefinedInternalViewFunc',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '_someText');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('string');
    expect(param1?.storageLocation).to.equal('memory');

    const param2 = func.parameters.parameters.find((param) => param.name === '_result');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('bool');
  });

  it('MockContractAbstract must include unimplemented internal view function override', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === '_undefinedInternalViewFunc',
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    const param1 = func.parameters.parameters.find((param) => param.name === '_someText');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('string');
    expect(param1?.storageLocation).to.equal('memory');

    const returnParam1 = func.returnParameters.parameters.find((param) => param.name === '_result');
    expect(returnParam1).to.not.be.undefined;
    expect(returnParam1?.typeDescriptions.typeString).to.equal('bool');
  });
});
