import { Ast, ImportDirectiveNode } from "./types";

export const getImports = (sourceFilePath: string): Promise<string[]> => {
  return new Promise<string[]>((resolve) => {
    // Get the ast from the compiled output
    const ast: Ast = require(sourceFilePath).ast;
    // Grab all the nodes related to imports
    const importNodes: ImportDirectiveNode[] = ast.nodes.filter(
      (node): node is ImportDirectiveNode => node.nodeType === "ImportDirective"
    );

    // Create the import code for every node and save it in the importStatements array
    const importStatements: string[] = importNodes.map((importDirective) => {
      const { symbolAliases, absolutePath } = importDirective;
      // If symbolAliases length is above 0 then that means the contract has named imports
      if (symbolAliases.length > 0) {
        const imports = symbolAliases.map(
          (symbolAlias) => symbolAlias.foreign.name
        );
        return `import {${imports.join(", ")}} from '${absolutePath}';`;
      } else {
        return `import '${absolutePath}';`;
      }
    });

    resolve(importStatements);
  });
};
