import { writeFileSync } from 'fs';
import {
  getContractTemplate,
  getSmockHelperTemplate,
  renderNodeMock,
  emptySmockDirectory,
  getSourceUnits,
  smockableNode,
  compileSolidityFilesFoundry
} from './utils';
import path from 'path';
import { ensureDir } from 'fs-extra';

/**
 * Generates the mock contracts
 * @param mocksDirectory The directory where the mock contracts will be generated
 */
export async function generateMockContracts(rootPath: string, contractsDirectories: string[],  mocksDirectory: string, ignoreDirectories: string[]) {
  await emptySmockDirectory(mocksDirectory);
  const contractTemplate = getContractTemplate();

  try {
    console.log('Parsing contracts...');

    try {
      const sourceUnits = await getSourceUnits(rootPath, contractsDirectories, ignoreDirectories);

      if (!sourceUnits.length) return console.error('No solidity files found in the specified directory');

      for(const sourceUnit of sourceUnits) {
        let importsContent = '';
        // First process the imports, they will be on top of each mock contract
        for(const importDirective of sourceUnit.vImportDirectives) {
          importsContent += await renderNodeMock(importDirective);
        }

        for(const contract of sourceUnit.vContracts) {
          let mockContent = '';
          // Libraries are not mocked
          if(contract.kind === 'library') continue;

          for(const node of contract.children) {
            if(!smockableNode(node)) continue;
            mockContent += await renderNodeMock(node);
          }

          if (mockContent === '') continue;

          const scope = contract.vScope;
          const sourceContractAbsolutePath = path.resolve(rootPath, sourceUnit.absolutePath);

          // The mock contract is written to the mocks directory, taking into account the source contract's place in the directory structure
          // So if the source is in a subdirectory of the contracts directory, the mock will be in the same subdirectory of the mocks directory
          const escapedSubstrings = contractsDirectories.map(directory => directory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          const regexPattern = new RegExp(escapedSubstrings.join('|'), 'g');
          const mockContractPath = scope.absolutePath.replace(regexPattern, mocksDirectory).replace(path.basename(sourceUnit.absolutePath), `Mock${contract.name}.sol`);
          const mockContractAbsolutePath = path.resolve(rootPath, mockContractPath);

          // Relative path to the source is used in mock's imports
          const sourceContractRelativePath = path.relative(path.dirname(mockContractAbsolutePath), sourceContractAbsolutePath);

          const contractCode: string = contractTemplate({
            content: mockContent,
            importsContent: importsContent,
            contractName: contract.name,
            sourceContractRelativePath: sourceContractRelativePath,
            exportedSymbols: Array.from(scope.exportedSymbols.keys()),
            license: sourceUnit.license
          })
          // TODO: check if there are other symbols we should account for, or if there is a better way to handle this
          // TODO: Check if there is a better way to handle the HTML encoded characters, for instance with `compile` options
          .replace(/&#x27;/g, "'")
          .replace(/&#x3D;/g, '=')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&lt;/g, '<')
          .replace(/;;/g, ';');

          await ensureDir(path.dirname(mockContractAbsolutePath));
          writeFileSync(mockContractAbsolutePath, contractCode);
        }
      }

      // Generate SmockHelper contract
      const smockHelperTemplate = await getSmockHelperTemplate();
      const smockHelperCode: string = smockHelperTemplate({});
      writeFileSync(`${mocksDirectory}/SmockHelper.sol`, smockHelperCode);

      console.log('Mock contracts generated successfully');

      await compileSolidityFilesFoundry(mocksDirectory);
    } catch(error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
}
