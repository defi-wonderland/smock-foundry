import { userDefinedTypes, explicitTypes } from './types';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

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
  const templatePath = resolve(__dirname, 'templates', 'contract-template.hbs');
  const templateContent = readFileSync(templatePath, 'utf8');
  return templateContent;
};

export const registerSmockHelperTemplate = (): string => {
  const smockHelperTemplatePath = resolve(__dirname, 'templates', 'helper-template.hbs');
  const smockHelperTemplateContent = readFileSync(smockHelperTemplatePath, 'utf8');
  return smockHelperTemplateContent;
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
