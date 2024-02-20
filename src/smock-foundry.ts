import { getExternalMockFunctions, getInternalMockFunctions, getConstructor, getImports, getStateVariables, Ast } from './index';
import {
  getSubDirNameFromPath,
  registerHandlebarsTemplates,
  getContractNamesAndFolders,
  compileSolidityFilesFoundry,
  registerSmockHelperTemplate,
  getSolidityFilesAbsolutePaths,
  readPartial
} from './utils';
import Handlebars from 'handlebars';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import { ensureDir, emptyDir } from 'fs-extra';
import { resolve } from 'path';
import { StateVariablesOptions, ContractDefinitionNode } from './types';
import { ASTKind, ASTReader, SourceUnit, compileSol, FunctionDefinition, VariableDeclaration } from 'solc-typed-ast';

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

    try {
      const includedPaths = ['solidity/contracts/utils/ContractE.sol'];
      const solidityFiles: string[] = await getSolidityFilesAbsolutePaths(includedPaths);
      const rootPath = './solidity/contracts';
      const remappings = [];

      const compiledFiles = await compileSol(solidityFiles, 'auto', {
        basePath: rootPath,
        remapping: remappings,
        includePath: [rootPath],
      });

      const sourceUnits = new ASTReader().read(compiledFiles.data, ASTKind.Any, compiledFiles.files).filter((sourceUnit) => includedPaths.includes(sourceUnit.absolutePath));

      const contracts = sourceUnits.flatMap(s => s.vContracts);
      let mockContent = '';
      for(const contract of contracts) {
        for(const node of contract.children) {
          if (node instanceof VariableDeclaration) {
            const partialContent = await readPartial('state-variable');
            const partial = Handlebars.compile(partialContent);
            mockContent += partial({});
          } else if (node instanceof FunctionDefinition) {
            if (node.visibility === 'external') {
              const partialContent = await readPartial('external-function');
              const partial = Handlebars.compile(partialContent);
              mockContent += partial({});
            } else {
              const partialContent = await readPartial('internal-function');
              const partial = Handlebars.compile(partialContent);
              mockContent += partial({});
            }
          }
        }
      }

      // TODO: Compile the contract template
      // writeFileSync(`${contractFolder}/Mock${contractName}.sol`, cleanedCode);
      console.log(mockContent);

      // Generate SmockHelper contract
      const smockHelperTemplateContent: string = registerSmockHelperTemplate();
      const smockHelperTemplate = Handlebars.compile(smockHelperTemplateContent);
      const smockHelperCode: string = smockHelperTemplate({});
      writeFileSync(`${generatedContractsDir}/SmockHelper.sol`, smockHelperCode);

      console.log('Mock contracts generated successfully');

      // Compile the mock contracts
      await compileSolidityFilesFoundry(generatedContractsDir);
    } catch(e) {
      console.error(e);
    }
  } catch (error) {
    console.log(error);
  }
};
