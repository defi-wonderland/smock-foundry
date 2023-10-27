import { expect } from 'chai';
import { Ast, ImportDirectiveNode } from '../../src/types';
import { getImports } from '../../src/get-imports';

describe('getImports', () => {
  let ast: Ast;
  beforeEach(() => {
    // Reset ast
    ast = {
      absolutePath: 'test.sol',
      nodeType: 'SourceUnit',
      src: '',
      nodes: [],
      license: '',
      exportedSymbols: {},
    };
  });
  it('should return an empty array if there are no import directives', async () => {
    const importStatements = getImports(ast);
    expect(importStatements).to.be.an('array').that.is.empty;
  });

  it('should return the correct import statement when there are no named imports', async () => {
    ast.nodes = [
      {
        nodeType: 'ImportDirective',
        absolutePath: 'test.sol',
        file: 'test.sol',
        symbolAliases: [],
      },
    ] as ImportDirectiveNode[];
    const importStatements = getImports(ast);
    expect(importStatements).to.be.an('array').that.is.not.empty;
    expect(importStatements[0]).to.be.equal(`import 'test.sol';`);
  });

  it('should return the correct import statement when there are named imports', async () => {
    ast.nodes = [
      {
        nodeType: 'ImportDirective',
        absolutePath: 'test.sol',
        file: 'test.sol',
        symbolAliases: [
          {
            foreign: {
              name: 'test',
              nodeType: 'Identifier',
            },
          },
        ],
      },
    ] as ImportDirectiveNode[];
    const importStatements = getImports(ast);
    expect(importStatements).to.be.an('array').that.is.not.empty;
    expect(importStatements[0]).to.be.equal(`import {test} from 'test.sol';`);
  });
});
