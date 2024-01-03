// Write e2e tests for the getExternalFunctions function here like the other tests.
import { expect } from 'chai';
import { ContractDefinitionNode, FunctionDefinitionNode } from '../../src/types';
import { generateMockContracts } from '../../src/index';
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

    const param1 = constructor.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');
  });

  it('MockContractTest must include external function mock call', async () => {
    const contractNode = contractNodes['MockContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call_setVariables' && node.parameters.parameters.length === 2,
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '_newValue');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const param2 = func.parameters.parameters.find((param) => param.name === '_result');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('bool');
  });

  it('MockIContractTest must include interface function', async () => {
    const contractNode = contractNodes['MockIContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'setVariables' && node.parameters.parameters.length === 8,
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    const param1 = func.parameters.parameters.find((param) => param.name === '_newValue');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const param2 = func.parameters.parameters.find((param) => param.name === '_newString');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('string');
    expect(param2?.storageLocation).to.equal('memory');

    const param3 = func.parameters.parameters.find((param) => param.name === '_newBool');
    expect(param3).to.not.be.undefined;
    expect(param3?.typeDescriptions.typeString).to.equal('bool');

    const param4 = func.parameters.parameters.find((param) => param.name === '_newAddress');
    expect(param4).to.not.be.undefined;
    expect(param4?.typeDescriptions.typeString).to.equal('address');

    const param5 = func.parameters.parameters.find((param) => param.name === '_newBytes32');
    expect(param5).to.not.be.undefined;
    expect(param5?.typeDescriptions.typeString).to.equal('bytes32');

    const param6 = func.parameters.parameters.find((param) => param.name === '_addressArray');
    expect(param6).to.not.be.undefined;
    expect(param6?.typeDescriptions.typeString).to.equal('address[]');
    expect(param6?.storageLocation).to.equal('memory');

    const param7 = func.parameters.parameters.find((param) => param.name === '_uint256Array');
    expect(param7).to.not.be.undefined;
    expect(param7?.typeDescriptions.typeString).to.equal('uint256[]');
    expect(param7?.storageLocation).to.equal('memory');

    const param8 = func.parameters.parameters.find((param) => param.name === '_bytes32Array');
    expect(param8).to.not.be.undefined;
    expect(param8?.typeDescriptions.typeString).to.equal('bytes32[]');
    expect(param8?.storageLocation).to.equal('memory');

    const returnParam1 = func.returnParameters.parameters.find((param) => param.name === '_result');
    expect(returnParam1).to.not.be.undefined;
    expect(returnParam1?.typeDescriptions.typeString).to.equal('bool');
  });

  it('MockIContractTest must include external function mock call', async () => {
    const contractNode = contractNodes['MockIContractTest'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call_setVariables' && node.parameters.parameters.length === 3,
    ) as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;
    expect(func.visibility).to.equal('public');

    const param1 = func.parameters.parameters.find((param) => param.name === '_param0');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');

    const param2 = func.parameters.parameters.find((param) => param.name === '_param1');
    expect(param2).to.not.be.undefined;
    expect(param2?.typeDescriptions.typeString).to.equal('bool');

    const param3 = func.parameters.parameters.find((param) => param.name === '_returnParam0');
    expect(param3).to.not.be.undefined;
    expect(param3?.typeDescriptions.typeString).to.equal('bool');
  });

  it('MockContractAbstract must include constructor', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const constructor = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.kind === 'constructor',
    ) as FunctionDefinitionNode;
    expect(constructor).to.not.be.undefined;

    const param1 = constructor.parameters.parameters.find((param) => param.name === '_uintVariable');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('uint256');
  });

  it('MockContractAbstract must include unimplemented external function', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find((node) => node.nodeType === 'FunctionDefinition' && node.name === 'undefinedFunc') as FunctionDefinitionNode;
    expect(func).to.not.be.undefined;

    const param1 = func.parameters.parameters.find((param) => param.name === '_someText');
    expect(param1).to.not.be.undefined;
    expect(param1?.typeDescriptions.typeString).to.equal('string');
    expect(param1?.storageLocation).to.equal('memory');

    const returnParam1 = func.returnParameters.parameters.find((param) => param.name === '_result');
    expect(returnParam1).to.not.be.undefined;
    expect(returnParam1?.typeDescriptions.typeString).to.equal('bool');
  });

  it('MockContractAbstract must include unimplemented external function mock call', async () => {
    const contractNode = contractNodes['MockContractAbstract'];
    const func = contractNode.nodes.find(
      (node) => node.nodeType === 'FunctionDefinition' && node.name === 'mock_call_undefinedFunc',
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
});
