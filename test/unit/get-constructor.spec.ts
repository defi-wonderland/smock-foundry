import { getConstructor } from '../../src/get-constructor';
import { expect } from 'chai';
import { ContractDefinitionNode } from '../../src/types';


describe('getConstructor', () => {
  let contractNode: ContractDefinitionNode;
  beforeEach(() => {
    // Reset contract node
    contractNode = {
      nodeType: 'ContractDefinition',
      canonicalName: 'MyContract',
      nodes: [],
      abstract: false,
      baseContracts: [],
      contractKind: 'contract',
      name: 'MyContract',
    };
  });
  it('should return undefined if there are no functions', async () => {
    const constructorSignature = getConstructor(contractNode);
    expect(constructorSignature).to.be.undefined;
  });

  it('should return undefined if there is no constructor', async () => {
    contractNode.nodes = [
      {
        name: 'myFunction',
        nodeType: 'FunctionDefinition',
        kind: 'function',
        parameters: {
          parameters: [],
        },
        returnParameters: {
          parameters: [],
        },
        virtual: false,
        visibility: 'public',
      },
    ];
    const constructorSignature = getConstructor(contractNode);
    expect(constructorSignature).to.be.undefined;
  });

  it('should return the correct signature when storage location param is memory', async () => {
    contractNode.nodes = [
      {
        name: '',
        nodeType: 'FunctionDefinition',
        kind: 'constructor',
        parameters: {
          parameters: [
            {
              name: '_greeting',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'memory',
            }
          ],
        },
        returnParameters: {
          parameters: [],
        },
        virtual: false,
        visibility: 'public',
      },
    ];
    const constructorSignature = getConstructor(contractNode);
    expect(constructorSignature).to.equal(
      'constructor(string memory _greeting) MyContract(_greeting) {}'
    );
  });
  
  it('should return the correct signature when storage location param is calldata', async () => {
    contractNode.nodes = [
      {
        name: '',
        nodeType: 'FunctionDefinition',
        kind: 'constructor',
        parameters: {
          parameters: [
            {
              name: '_greeting',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'string',
              },
              storageLocation: 'calldata',
            }
          ],
        },
        returnParameters: {
          parameters: [],
        },
        virtual: false,
        visibility: 'public',
      },
    ];
    const constructorSignature = getConstructor(contractNode);
    expect(constructorSignature).to.equal(
      'constructor(string calldata _greeting) MyContract(_greeting) {}'
    );
  });

  it('should return the correct signature when param is a contract', async () => {
    contractNode.nodes = [
      {
        name: '',
        nodeType: 'FunctionDefinition',
        kind: 'constructor',
        parameters: {
          parameters: [
            {
              name: '_token',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'contract IERC20',
              },
              storageLocation: '',
            }
          ],
        },
        returnParameters: {
          parameters: [],
        },
        virtual: false,
        visibility: 'public',
      },
    ];
    const constructorSignature = getConstructor(contractNode);
    expect(constructorSignature).to.equal(
      'constructor(IERC20 _token) MyContract(_token) {}'
    );
  });

  it('should return the correct signature when param is a struct', async () => {
    contractNode.nodes = [
      {
        name: '',
        nodeType: 'FunctionDefinition',
        kind: 'constructor',
        parameters: {
          parameters: [
            {
              name: '_myStruct',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'struct MyStruct',
              },
              storageLocation: 'memory',
            }
          ],
        },
        returnParameters: {
          parameters: [],
        },
        virtual: false,
        visibility: 'public',
      },
    ];
    const constructorSignature = getConstructor(contractNode);
    expect(constructorSignature).to.equal(
      'constructor(MyStruct memory _myStruct) MyContract(_myStruct) {}'
    );
  });

  it('should return the correct signature when param is an enum', async () => {
    contractNode.nodes = [
      {
        name: '',
        nodeType: 'FunctionDefinition',
        kind: 'constructor',
        parameters: {
          parameters: [
            {
              name: '_myEnum',
              nodeType: 'VariableDeclaration',
              typeDescriptions: {
                typeString: 'enum MyEnum',
              },
              storageLocation: 'memory',
            }
          ],
        },
        returnParameters: {
          parameters: [],
        },
        virtual: false,
        visibility: 'public',
      },
    ];
    const constructorSignature = getConstructor(contractNode);
    expect(constructorSignature).to.equal(
      'constructor(MyEnum memory _myEnum) MyContract(_myEnum) {}'
    );
  });
});