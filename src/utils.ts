import { arrayRegex, memoryTypes, structRegex } from './types';
import { resolve, join, relative, dirname } from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';
import { exec } from 'child_process';
import Handlebars from 'handlebars';
import { promisify } from 'util';

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
 * Returns the string with the type fixed, for example if the type is string it will return `string memory`
 * @param str The string to fix the type
 * @returns The string with the type fixed
 */
export const typeFix = (str: string): string => {
  if (memoryTypes.includes(str) || arrayRegex.exec(str)) {
    return `${str} memory`;
  } else if (structRegex.exec(str)) {
    return `${str} memory`;
  } else {
    return str;
  }
};

/**
 * Registers the nested templates
 * @returns The content of the template
 */
export const registerHandlebarsTemplates = (): string => {
  // Template paths
  const templatePath = resolve(__dirname, 'templates', 'mockContractTemplate.hbs');
  const externalFuncsTemplatePath = resolve(__dirname, 'templates', 'mockExternalFunctionTemplate.hbs');
  const internalFuncsTemplatePath = resolve(__dirname, 'templates', 'mockInternalFunctionTemplate.hbs');
  const basicStateVariablesTemplatePath = resolve(__dirname, 'templates', 'mockBasicStateVariableTemplate.hbs');
  const arrayStateVariablesTemplatePath = resolve(__dirname, 'templates', 'mockArrayStateVariableTemplate.hbs');
  const mappingStateVariablesTemplatePath = resolve(__dirname, 'templates', 'mockMappingStateVariableTemplate.hbs');

  // Read the templates
  const templateContent = readFileSync(templatePath, 'utf8');
  const externalFuncsTemplateContent = readFileSync(externalFuncsTemplatePath, 'utf8');
  const internalFuncsTemplateContent = readFileSync(internalFuncsTemplatePath, 'utf8');
  const basicStateVariablesTemplateContent = readFileSync(basicStateVariablesTemplatePath, 'utf8');
  const arrayStateVariablesTemplateContent = readFileSync(arrayStateVariablesTemplatePath, 'utf8');
  const mappingStateVariablesTemplateContent = readFileSync(mappingStateVariablesTemplatePath, 'utf8');

  // Register the partial templates
  Handlebars.registerPartial('mockStateVariable', basicStateVariablesTemplateContent);
  Handlebars.registerPartial('mockExternalFunction', externalFuncsTemplateContent);
  Handlebars.registerPartial('mockInternalFunction', internalFuncsTemplateContent);
  Handlebars.registerPartial('mockArrayStateVariable', arrayStateVariablesTemplateContent);
  Handlebars.registerPartial('mockMappingStateVariable', mappingStateVariablesTemplateContent);

  return templateContent;
};

export const registerSmockHelperTemplate = (): string => {
  const smockHelperTemplatePath = resolve(__dirname, 'templates', 'smockHelperTemplate.hbs');
  const smockHelperTemplateContent = readFileSync(smockHelperTemplatePath, 'utf8');
  Handlebars.registerPartial('smockHelperTemplate', smockHelperTemplateContent);
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
export const compileSolidityFilesFoundry = async (mockContractsDir: string) => {
  console.log('Compiling contracts...');
  try {
    const { stdout, stderr } = await promisify(exec)(`forge build -C ${mockContractsDir}`);
    if (stderr) throw new Error(stderr);
    if (stdout) console.log(stdout);
  } catch (e) {
    throw new Error(`Error while compiling contracts: ${e}`);
  }
};
