import { getExternalMockFunctions, getInternalMockFunctions, getConstructor, getImports, getStateVariables, Ast } from './index';
import { getSubDirNameFromPath, registerHandlebarsTemplates, getContractNamesAndFolders, compileSolidityFilesFoundry } from './utils';
import Handlebars from 'handlebars';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import { ensureDir, emptyDir } from 'fs-extra';
import { resolve } from 'path';
import { StateVariablesOptions, ContractDefinitionNode } from './types';

/**
 * Generates the mock contracts
 * @param contractsDir The directory where the contracts are located
 * @param compiledArtifactsDir The directory where the compiled artifacts are located
 * @param generatedContractsDir The directory where the mock contracts will be generated
 */
export const generateMockContracts = async (
  contractsDir: string[],
  compiledArtifactsDir: string,
  generatedContractsDir: string,
  ignoreDir: string[],
) => {
  const templateContent: string = registerHandlebarsTemplates();
  const template = Handlebars.compile(templateContent);
  try {
    // Create the directory if it doesn't exist
    try {
      await ensureDir(generatedContractsDir);
    } catch (error) {
      console.error('Error while creating the mock directory: ', error);
    }

    // Empty the directory, if it exists
    try {
      await emptyDir(generatedContractsDir);
    } catch (error) {
      console.error('Error while trying to empty the mock directory: ', error);
    }
    console.log('Parsing contracts...');

    // Get all contracts names and paths
    const [contractFileNames, contractFolders] = getContractNamesAndFolders(contractsDir, ignoreDir);

    // Loop for each contract path
    contractFileNames.forEach(async (contractFileName: string, ind: number) => {
      // Get the sub dir name
      const subDirName: string = getSubDirNameFromPath(contractFileName);

      // Get contract name
      // If the contract and the file have different names, it will be modified.
      let contractName: string = subDirName.replace('.json', '');

      // Get the compiled path
      // If the contract and the file have different names, it will be modified.
      let compiledArtifactsPath = resolve(compiledArtifactsDir, contractFileName, subDirName);

      // Check if contract and file have different names
      if (!existsSync(compiledArtifactsPath)) {
        const directoryPath = resolve(compiledArtifactsDir, contractFileName);

        // If the directory path does not exist, the contract is not compiled.
        if (!existsSync(directoryPath)) return;

        // Read inside the directory path
        const subDirContractName = readdirSync(directoryPath);

        // Get the real path of the json file
        // If this !path means that the file is not compiled
        compiledArtifactsPath = resolve(compiledArtifactsDir, contractFileName, subDirContractName[0]);
        if (!compiledArtifactsPath) return;

        contractName = subDirContractName[0].replace('.json', '');
      }
      // Get the ast
      const ast: Ast = require(compiledArtifactsPath).ast;
      // Check if the abi and ast exist
      if (!ast) return;

      // Get the absolute path from the ast
      const contractImport: string = ast.absolutePath;
      if (!contractImport) return;

      // Get all exported entities
      const exportedSymbols = Object.keys(ast.exportedSymbols);

      // Get the contract node and check if it's a library
      // Also check if is another contract inside the file and avoid it
      const contractNode = ast.nodes.find(
        (node) => node.nodeType === 'ContractDefinition' && node.canonicalName === contractName,
      ) as ContractDefinitionNode;

      // Skip unneeded contracts
      if (!contractNode || contractNode.abstract || contractNode.contractKind === 'library') return;

      const functions: StateVariablesOptions = getStateVariables(contractNode);
      // All data which will be use for create the template

      const data = {
        contractName: contractName,
        contractImport: contractImport,
        exportedSymbols: exportedSymbols.join(', '),
        import: getImports(ast),
        constructor: getConstructor(contractNode),
        mockExternalFunctions: getExternalMockFunctions(contractNode),
        mockInternalFunctions: getInternalMockFunctions(contractNode),
        mockStateVariables: functions.basicStateVariables,
        mockArrayStateVariables: functions.arrayStateVariables,
        mockMappingStateVariables: functions.mappingStateVariables,
      };

      console.log(`Generating mock contract for ${contractName}...`);
      // Fill the handlebars template with the data
      const code: string = template(data);

      // some symbols seem to appear as unicode hex chars so replace them
      // TODO: check if there are other symbols we should account for, or if there is a better way to handle this
      const cleanedCode: string = code
        .replace(/&#x27;/g, "'")
        .replace(/&#x3D;/g, '=')
        .replace(/;;/g, ';');

      // Write the contract
      const contractFolder = `${generatedContractsDir}/${contractFolders[ind]}`;
      // Create the directory if it doesn't exist
      try {
        await ensureDir(contractFolder);
      } catch (error) {
        console.error('Error while creating the mock directory: ', error);
      }

      writeFileSync(`${contractFolder}/Mock${contractName}.sol`, cleanedCode);
    });

    console.log('Mock contracts generated successfully');
    // Compile the mock contracts
    await compileSolidityFilesFoundry(generatedContractsDir);
  } catch (error) {
    console.log(error);
  }
};
