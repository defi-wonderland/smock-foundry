import { userDefinedTypes, explicitTypes } from './types';
import { resolve, join, relative, dirname } from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';
import { exec } from 'child_process';
import Handlebars from 'handlebars';
import { promisify } from 'util';
import path from 'path';

/**
 * Given a path returns the name of the file with the extension replaced with .json
 * e.g. if the path is `contracts/MyContract.sol` it will return `MyContract.json`
 * @param path The path of the file
 * @returns The name of the file with the extension replaced with .json
 */
export const getSubDirNameFromPath = (path: string): string => {
  // Split the path by the slash
  const pathSegments: string[] = path.split('/');
  // Get the last file
  const lastFile: string = pathSegments[pathSegments.length - 1];
  // Get the subDir name
  const subDir: string = lastFile.replace('.sol', '.json');
  return subDir;
};

/**
 * Returns the string with the first letter capitalized
 * @param str The string to capitalize the first letter
 * @returns The string with the first letter capitalized
 */
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Returns the string with the first letter lowercase
 * @param str The string to lowercase the first letter
 * @returns The string with the first letter lowercase
 */
export const lowercaseFirstLetter = (str: string): string => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

/**
 * Fixes user-defined types
 * @param type The string of the type to fix
 * @returns The string with the type fixed
 */
export const sanitizeParameterType = (type: string): string => {
  const regExp = new RegExp(`^(${userDefinedTypes.join('|')}) `);
  return type.replace(regExp, '');
};

/**
 * Explicits a type's storage location, if required
 * @param type The string of the type to explicit
 * @returns The string with the type explicit
 */
export const explicitTypeStorageLocation = (type: string): string => {
  const regExp = new RegExp(`^(${explicitTypes.join('|')})\\b`);
  if (regExp.test(type) || type.includes('[]')) {
    return `${type} memory`;
  } else {
    return type;
  }
};

/**
 * Registers the nested templates
 * @returns The content of the template
 */
export const registerHandlebarsTemplates = (): string => {
  [
    'state-variable',
    'array-state-variable',
    'mapping-state-variable',
    'external-function',
    'internal-function',
  ].forEach((partialName: string) => {
    const partialPath = resolve(__dirname, 'templates', 'partials', `${partialName}.hbs`);
    const partialContent = readFileSync(partialPath, 'utf8');
    Handlebars.registerPartial(partialName, partialContent);
  });

  // TODO: Do we need to register templates? This one is never registered
  const templatePath = resolve(__dirname, 'templates', 'contract-template.hbs');
  const templateContent = readFileSync(templatePath, 'utf8');
  return templateContent;
};

export const registerSmockHelperTemplate = (): string => {
  const smockHelperTemplatePath = resolve(__dirname, 'templates', 'helper-template.hbs');
  const smockHelperTemplateContent = readFileSync(smockHelperTemplatePath, 'utf8');
  Handlebars.registerPartial('helper-template', smockHelperTemplateContent);
  return smockHelperTemplateContent;
};

/**
 * Returns the names of the contracts in the given directory and its subdirectories
 * @param contractsDir The directory where the contracts are located
 * @returns The names of the contracts in the given directory and its subdirectories
 */
export const getContractNamesAndFolders = (contractsDir: string[], ignoreDir: string[]): [string[], string[]] => {
  const contractFileNames: string[] = [];
  const contractFolders: string[] = [];
  // Recursive function to traverse the directory and its subdirectories
  function traverseDirectory(currentPath: string, baseDir: string) {
    const fileNames = readdirSync(currentPath);
    // Loop through the files and directories
    fileNames.forEach((fileName: string) => {
      const filePath = join(currentPath, fileName);
      const stats = statSync(filePath);
      // If the file is a contract then we add it to the array, if it is a directory then we call the function again
      if (stats.isFile() && fileName.endsWith('.sol')) {
        contractFileNames.push(fileName);
        contractFolders.push(dirname(relative(baseDir, filePath)));
      } else if (stats.isDirectory() && !ignoreDir.includes(fileName)) {
        traverseDirectory(filePath, baseDir);
      }
    });
  }

  contractsDir.map((dir: string) => {
    traverseDirectory(dir, dirname(dir));
  });

  return [contractFileNames, contractFolders];
};

/**
 * Compiles the solidity files in the given directory calling forge build command
 * @param mockContractsDir The directory of the generated contracts
 */
export async function compileSolidityFilesFoundry(mockContractsDir: string) {
  console.log('Compiling contracts...');
  try {
    const { stdout, stderr } = await promisify(exec)(`forge build -C ${mockContractsDir}`);
    if (stderr) throw new Error(stderr);
    if (stdout) console.log(stdout);
  } catch (e) {
    throw new Error(`Error while compiling contracts: ${e}`);
  }
}

export async function getSolidityFilesAbsolutePaths(files: string[]): Promise<string[]> {
  return files.filter((file) => file.endsWith('.sol')).map((file) => path.resolve(file));
}

export async function readPartial(partialName: string): Promise<string> {
  const partialPath = resolve(__dirname, 'templates', 'partials', `${partialName}.hbs`);
  const partialContent = readFileSync(partialPath, 'utf8');
  return partialContent;
}
