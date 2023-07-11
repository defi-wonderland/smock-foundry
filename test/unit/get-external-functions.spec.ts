// Write unit tests for the getExternalFunctions function here like the other tests.
import { getExternalMockFunctions } from '../../src/get-external-functions';
import { expect } from 'chai';
import { ContractDefinitionNode, ExternalFunctionOptions, VariableDeclarationNode } from '../../src/types';

// We use the describe function to group together related tests
describe('getExternalMockFunctions', () => {
    // We use the beforeEach function to reset the contract node before each test
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

    // We use the it function to create a test
    it('should return an empty array if there are no functions', async () => {
        const externalFunctions = getExternalMockFunctions(contractNode);
        expect(externalFunctions).to.be.an('array').that.is.empty;
    });

    it('should return an empty array if there are no external functions', async () => {
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
                visibility: 'internal',
            },
            {
                name: 'myFunction2',
                nodeType: 'FunctionDefinition',
                kind: 'function',
                parameters: {
                    parameters: [],
                },
                returnParameters: {
                    parameters: [],
                },
                virtual: false,
                visibility: 'private',
            }
        ];
        const externalFunctions = getExternalMockFunctions(contractNode);
        expect(externalFunctions).to.be.an('array').that.is.empty;
    });

    it('should return an empty array if the function is not a function kind', async () => {
        contractNode.nodes = [
            {
                name: 'myFunction',
                nodeType: 'FunctionDefinition',
                kind: 'constructor',
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
        const externalFunctions = getExternalMockFunctions(contractNode);
        expect(externalFunctions).to.be.an('array').that.is.empty;
    });

    it('should return the correct function data when storage location param is memory or calldata', async () => {
        contractNode.nodes = [
            {
                name: 'myFunction',
                nodeType: 'FunctionDefinition',
                kind: 'function',
                parameters: {
                    parameters: [
                        {
                            name: '_param',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'string',
                            },
                            storageLocation: 'memory',
                        },
                        {
                            name: '_param2',
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
        const externalFunctions = getExternalMockFunctions(contractNode);
        const expectedData: ExternalFunctionOptions[] = [
            {
                functionName: 'myFunction',
                arguments: 'string memory _param, string calldata _param2',
                signature: 'myFunction(string, string)',
                inputsStringNames: ', _param, _param2',
                outputsStringNames: '',
            }
        ]
        expect(externalFunctions).to.be.an('array').that.is.not.empty;
        expect(externalFunctions).to.deep.equal(expectedData);
    });

    it('should return the correct function data when param type is contract/struct/enum', async () => {
        contractNode.nodes = [
            {
                name: 'myFunction',
                nodeType: 'FunctionDefinition',
                kind: 'function',
                parameters: {
                    parameters: [
                        {
                            name: '_param',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'contract IERC20',
                            },
                            storageLocation: '',
                        },
                        {
                            name: '_param2',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'struct MyStruct',
                            },
                            storageLocation: '',
                        },
                        {
                            name: '_param3',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'enum MyEnum',
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
        const externalFunctions = getExternalMockFunctions(contractNode);
        const expectedData: ExternalFunctionOptions[] = [
            {
                functionName: 'myFunction',
                arguments: 'IERC20 _param, MyStruct _param2, MyEnum _param3',
                signature: 'myFunction(IERC20, MyStruct, MyEnum)',
                inputsStringNames: ', _param, _param2, _param3',
                outputsStringNames: '',
            }
        ]
        expect(externalFunctions).to.be.an('array').that.is.not.empty;
        expect(externalFunctions).to.deep.equal(expectedData);
    });

    it('should return the correct function data when the output storage location is memory or calldata', async () => {
        contractNode.nodes = [
            {
                name: 'myFunction',
                nodeType: 'FunctionDefinition',
                kind: 'function',
                parameters: {
                    parameters: [],
                },
                returnParameters: {
                    parameters: [
                        {
                            name: '_param',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'string',
                            },
                            storageLocation: 'memory',
                        },
                        {
                            name: '_param2',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'string',
                            },
                            storageLocation: 'calldata',
                        }
                    ],
                },
                virtual: false,
                visibility: 'public',
            },
        ];
        const externalFunctions = getExternalMockFunctions(contractNode);
        const expectedData: ExternalFunctionOptions[] = [
            {
                functionName: 'myFunction',
                arguments: 'string memory _param, string calldata _param2',
                signature: 'myFunction()',
                inputsStringNames: '',
                outputsStringNames: '_param, _param2',
            }
        ]
        expect(externalFunctions).to.be.an('array').that.is.not.empty;
        expect(externalFunctions).to.deep.equal(expectedData);
    });

    it('should return the correct function data when the output type is contract/struct/enum', async () => {
        contractNode.nodes = [
            {
                name: 'myFunction',
                nodeType: 'FunctionDefinition',
                kind: 'function',
                parameters: {
                    parameters: [],
                },
                returnParameters: {
                    parameters: [
                        {
                            name: '_param',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'contract IERC20',
                            },
                            storageLocation: '',
                        },
                        {
                            name: '_param2',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'struct MyStruct',
                            },
                            storageLocation: '',
                        },
                        {
                            name: '_param3',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'enum MyEnum',
                            },
                            storageLocation: '',
                        }
                    ],
                },
                virtual: false,
                visibility: 'public',
            },
        ];
        const externalFunctions = getExternalMockFunctions(contractNode);
        const expectedData: ExternalFunctionOptions[] = [
            {
                functionName: 'myFunction',
                arguments: 'IERC20 _param, MyStruct _param2, MyEnum _param3',
                signature: 'myFunction()',
                inputsStringNames: '',
                outputsStringNames: '_param, _param2, _param3',
            }
        ]
        expect(externalFunctions).to.be.an('array').that.is.not.empty;
        expect(externalFunctions).to.deep.equal(expectedData);
    });

    it('should return the correct function data when there are both params and outputs', async () => {
        contractNode.nodes = [
            {
                name: 'myFunction',
                nodeType: 'FunctionDefinition',
                kind: 'function',
                parameters: {
                    parameters: [
                        {
                            name: '_param',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'string',
                            },
                            storageLocation: 'memory',
                        }
                    ],
                },
                returnParameters: {
                    parameters: [
                        {
                            name: '_output',
                            nodeType: 'VariableDeclaration',
                            typeDescriptions: {
                                typeString: 'string',
                            },
                            storageLocation: 'memory',
                        }
                    ],
                },
                virtual: false,
                visibility: 'public',
            },
        ];
        const externalFunctions = getExternalMockFunctions(contractNode);
        const expectedData: ExternalFunctionOptions[] = [
            {
                functionName: 'myFunction',
                arguments: 'string memory _param, string memory _output',
                signature: 'myFunction(string)',
                inputsStringNames: ', _param',
                outputsStringNames: '_output',
            }
        ]
        expect(externalFunctions).to.be.an('array').that.is.not.empty;
        expect(externalFunctions).to.deep.equal(expectedData);
    });
});