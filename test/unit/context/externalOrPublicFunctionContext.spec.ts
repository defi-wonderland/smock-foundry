import { expect } from 'chai';
import { DataLocation, FunctionStateMutability, FunctionVisibility } from 'solc-typed-ast';
import { mockFunctionDefinition, mockParameterList, mockVariableDeclaration } from '../../mocks';
import { externalOrPublicFunctionContext } from '../../../src/context';

describe('externalOrPublicFunctionContext', () => {
  const defaultAttributes = {
    name: 'testInternalFunction',
    visibility: FunctionVisibility.External,
    virtual: true,
    vParameters: mockParameterList({vParameters: []}),
    vReturnParameters: mockParameterList({vParameters: []}),
    implemented: true,
    functionStateMutability: FunctionStateMutability.NonPayable
  };

  it('throws an error if the function is not public nor external', () => {
    for(const visibility in FunctionVisibility) {
      if([FunctionVisibility.External, FunctionVisibility.Public].includes(FunctionVisibility[visibility])) continue;
      const node = mockFunctionDefinition({...defaultAttributes, visibility: FunctionVisibility[visibility] });
      expect(() => externalOrPublicFunctionContext(node)).to.throw('The function is not external nor public');
    }
  });

  it('processes functions without parameters and returned values', () => {
    const node = mockFunctionDefinition(defaultAttributes);
    const context = externalOrPublicFunctionContext(node);

    expect(context).to.eql({
      functionName: 'testInternalFunction',
      signature: 'testInternalFunction()',
      parameters: '',
      inputs: '',
      outputs: '',
      inputNames: [],
      outputNames: [],
      implemented: true,
      stateMutability: '',
      visibility: 'external'
    });
  });

  it('processes named parameters', () => {
    const parameters = [
      mockVariableDeclaration({ name: 'a', typeString: 'uint256' }),
      mockVariableDeclaration({ name: 'b', typeString: 'boolean' }),
    ];
    const node = mockFunctionDefinition({ ...defaultAttributes, vParameters: mockParameterList({vParameters: parameters}) });
    const context = externalOrPublicFunctionContext(node);

    expect(context).to.eql({
      functionName: 'testInternalFunction',
      signature: 'testInternalFunction(uint256,boolean)',
      parameters: 'uint256 a, boolean b',
      inputs: 'uint256 a, boolean b',
      outputs: '',
      inputNames: ['a', 'b'],
      outputNames: [],
      implemented: true,
      stateMutability: '',
      visibility: 'external'
    });
  });

  it('processes unnamed parameters', () => {
    const parameters = [
      mockVariableDeclaration({ typeString: 'uint256' }),
      mockVariableDeclaration({ typeString: 'boolean' }),
    ];
    const node = mockFunctionDefinition({ ...defaultAttributes, vParameters: mockParameterList({vParameters: parameters}) });
    const context = externalOrPublicFunctionContext(node);

    expect(context).to.eql({
      functionName: 'testInternalFunction',
      signature: 'testInternalFunction(uint256,boolean)',
      parameters: 'uint256 _param0, boolean _param1',
      inputs: 'uint256 _param0, boolean _param1',
      outputs: '',
      inputNames: ['_param0', '_param1'],
      outputNames: [],
      implemented: true,
      stateMutability: '',
      visibility: 'external'
    });
  });

  it('processes unnamed returned parameters', () => {
    const parameters = [
      mockVariableDeclaration({ typeString: 'uint256' }),
      mockVariableDeclaration({ typeString: 'boolean' }),
    ];
    const node = mockFunctionDefinition({ ...defaultAttributes, vReturnParameters: mockParameterList({vParameters: parameters}) });
    const context = externalOrPublicFunctionContext(node);

    expect(context).to.eql({
      functionName: 'testInternalFunction',
      signature: 'testInternalFunction()',
      parameters: 'uint256 _returnParam0, boolean _returnParam1',
      inputs: '',
      outputs: 'uint256 _returnParam0, boolean _returnParam1',
      inputNames: [],
      outputNames: ['_returnParam0', '_returnParam1'],
      implemented: true,
      stateMutability: '',
      visibility: 'external'
    });
  });

  it('processes named returned parameters', () => {
    const parameters = [
      mockVariableDeclaration({ name: 'a', typeString: 'uint256' }),
      mockVariableDeclaration({ name: 'b', typeString: 'boolean' }),
    ];
    const node = mockFunctionDefinition({ ...defaultAttributes, vReturnParameters: mockParameterList({vParameters: parameters}) });
    const context = externalOrPublicFunctionContext(node);

    expect(context).to.eql({
      functionName: 'testInternalFunction',
      signature: 'testInternalFunction()',
      parameters: 'uint256 a, boolean b',
      inputs: '',
      outputs: 'uint256 a, boolean b',
      inputNames: [],
      outputNames: ['a', 'b'],
      implemented: true,
      stateMutability: '',
      visibility: 'external'
    });
  });

  it('recognizes storage location of parameters', () => {
    const parameters = [
      mockVariableDeclaration({ name: 'a', typeString: 'uint256', storageLocation: DataLocation.Storage }),
      mockVariableDeclaration({ name: 'b', typeString: 'string', storageLocation: DataLocation.Memory }),
      mockVariableDeclaration({ name: 'c', typeString: 'bytes', storageLocation: DataLocation.CallData }),
      mockVariableDeclaration({ name: 'd', typeString: 'boolean', storageLocation: DataLocation.Default }),
    ];
    const node = mockFunctionDefinition({ ...defaultAttributes, vParameters: mockParameterList({vParameters: parameters}) });
    const context = externalOrPublicFunctionContext(node);

    expect(context).to.eql({
      functionName: 'testInternalFunction',
      signature: 'testInternalFunction(uint256,string,bytes,boolean)',
      parameters: 'uint256 a, string memory b, bytes calldata c, boolean d',
      inputs: 'uint256 a, string memory b, bytes calldata c, boolean d',
      outputs: '',
      inputNames: ['a', 'b', 'c', 'd'],
      outputNames: [],
      implemented: true,
      stateMutability: '',
      visibility: 'external'
    });
  });

  it('recognizes storage location of returned parameters', () => {
    const parameters = [
      mockVariableDeclaration({ name: 'a', typeString: 'uint256', storageLocation: DataLocation.Storage }),
      mockVariableDeclaration({ name: 'b', typeString: 'string', storageLocation: DataLocation.Memory }),
      mockVariableDeclaration({ name: 'c', typeString: 'bytes', storageLocation: DataLocation.CallData }),
      mockVariableDeclaration({ name: 'd', typeString: 'boolean', storageLocation: DataLocation.Default }),
    ];
    const node = mockFunctionDefinition({ ...defaultAttributes, vReturnParameters: mockParameterList({vParameters: parameters}) });
    const context = externalOrPublicFunctionContext(node);

    expect(context).to.eql({
      functionName: 'testInternalFunction',
      signature: 'testInternalFunction()',
      parameters: 'uint256 a, string memory b, bytes calldata c, boolean d',
      inputs: '',
      outputs: 'uint256 a, string memory b, bytes calldata c, boolean d',
      inputNames: [],
      outputNames: ['a', 'b', 'c', 'd'],
      implemented: true,
      stateMutability: '',
      visibility: 'external'
    });
  });

  it('determines whether the function is implemented or not', () => {
    for(const implemented of [true, false]) {
      const node = mockFunctionDefinition({ ...defaultAttributes, implemented: implemented });
      const context = externalOrPublicFunctionContext(node);
      expect(context.implemented).to.be.equal(implemented);
    }
  });
});
