import { Ast, ImportDirectiveNode } from './types';

/**
 * Returns an array with all the import signautres of the contract
 * @param ast The ast of the contract from foundry's compiled artifacts
 * @returns An array with all the import signautres of the contract
 */
export const getImports = (ast: Ast): string[] => {
  // Filter the nodes and keep only the ImportDirective related ones
  const importNodes = ast.nodes.filter(
    node => node.nodeType === 'ImportDirective'
  ) as ImportDirectiveNode[];

  // Create the import code for every node and save it in the importStatements array
  const importStatements: string[] = importNodes.map((importDirective) => {
    // Get the absolute path and the symbol aliases, the symbol aliases are the named imports
    const { symbolAliases, absolutePath } = importDirective;
    // If there are no named imports then we import the whole file
    if (!symbolAliases.length) {
      return `import '${absolutePath}';`;
    }
    // Get the names of the named imports
    const imports = symbolAliases.map(
      (symbolAlias) => symbolAlias.foreign.name
    );

    return `import {${imports.join(', ')}} from '${absolutePath}';`;
  });
  return importStatements;
};
