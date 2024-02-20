import Handlebars from 'handlebars';
import { writeFileSync } from 'fs';
import { ensureDir, emptyDir } from 'fs-extra';
import { ASTKind, ASTReader, compileSol, VariableDeclaration } from 'solc-typed-ast';
import {
  registerHandlebarsTemplates,
  registerSmockHelperTemplate,
  getSolidityFilesAbsolutePaths,
  renderNodeMock
} from './utils';

/**
 * Generates the mock contracts
 * @param mocksDirectory The directory where the mock contracts will be generated
 */
export async function generateMockContracts(mocksDirectory: string) {
  const contractTemplateContent: string = registerHandlebarsTemplates();
  const contractTemplate = Handlebars.compile(contractTemplateContent);
  // Create the directory if it doesn't exist
  try {
    await ensureDir(mocksDirectory);
  } catch (error) {
    console.error('Error while creating the mock directory: ', error);
  }

  // Empty the directory, if it exists
  try {
    await emptyDir(mocksDirectory);
  } catch (error) {
    console.error('Error while trying to empty the mock directory: ', error);
  }

  try {
    console.log('Parsing contracts...');

    try {
      const contractName = 'ContractTest';
      const includedPaths = [`solidity/contracts/${contractName}.sol`];
      const solidityFiles: string[] = await getSolidityFilesAbsolutePaths(includedPaths);
      const rootPath = './';
      const remappings = [];

      const compiledFiles = await compileSol(solidityFiles, 'auto', {
        basePath: rootPath,
        remapping: remappings,
        includePath: [rootPath],
      });

      const sourceUnits = new ASTReader()
        .read(compiledFiles.data, ASTKind.Any, compiledFiles.files)
        .filter((sourceUnit) => includedPaths.includes(sourceUnit.absolutePath));

      for(const sourceUnit of sourceUnits) {
        let importsContent = '';
        // First process the imports, they will be on top of each mock contract
        for(const importDirective of sourceUnit.vImportDirectives) {
          importsContent += await renderNodeMock(importDirective);
        }

        let mockContent = '';
        for(const contract of sourceUnit.vContracts) {
          for(const node of contract.children) {
            if (node instanceof VariableDeclaration) {
              // If the state variable is constant then we don't need to mock it
              if (node.constant || node.mutability === 'immutable') continue;
              // If the state variable is private we don't mock it
              if (node.visibility === 'private') continue;
            }

            mockContent += await renderNodeMock(node);
          }

          if (mockContent === '') continue;

          const scope = contract.vScope;
          const contractCode: string = contractTemplate({
            content: mockContent,
            importsContent: importsContent,
            contractName: contract.name,
            contractAbsolutePath: scope.absolutePath,
            exportedSymbols: Array.from(scope.exportedSymbols.keys()),
          })
          // TODO: check if there are other symbols we should account for, or if there is a better way to handle this
          // TODO: Check if there is a better way to handle the HTML encoded characters, for instance with `compile` options
          .replace(/&#x27;/g, "'")
          .replace(/&#x3D;/g, '=')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&lt;/g, '<')
          .replace(/;;/g, ';');

          writeFileSync(`${mocksDirectory}/Mock${contract.name}.sol`, contractCode);
        }
      }
      
      // Generate SmockHelper contract
      const smockHelperTemplateContent: string = registerSmockHelperTemplate();
      const smockHelperTemplate = Handlebars.compile(smockHelperTemplateContent);
      const smockHelperCode: string = smockHelperTemplate({});
      writeFileSync(`${mocksDirectory}/SmockHelper.sol`, smockHelperCode);

      console.log('Mock contracts generated successfully');

      // TODO: Compile the mock contracts
      // await compileSolidityFilesFoundry(mocksDirectory);
    } catch(error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}
