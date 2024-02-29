import Handlebars from 'handlebars';
import path from 'path';
import { glob } from 'fast-glob';
import { exec } from 'child_process';
import { VariableDeclaration, FunctionDefinition, ImportDirective, ASTNode, ASTKind, ASTReader, SourceUnit, compileSol } from 'solc-typed-ast';
import { userDefinedTypes, explicitTypes } from './types';
import { readFileSync } from 'fs'; // TODO: Replace with fs/promises
import { ensureDir, emptyDir } from 'fs-extra';
import fs from 'fs/promises';
import { promisify } from 'util';
import {
  importContext,
  mappingVariableContext,
  arrayVariableContext,
  stateVariableContext,
  constructorContext,
  externalOrPublicFunctionContext,
  internalFunctionContext
} from './context';

export const CONTEXT_RETRIEVERS = {
  'mapping-state-variable': mappingVariableContext,
  'array-state-variable': arrayVariableContext,
  'state-variable': stateVariableContext,
  'constructor': constructorContext,
  'external-or-public-function': externalOrPublicFunctionContext,
  'internal-function': internalFunctionContext,
  'import': importContext
}

/**
 * Fixes user-defined types
 * @param type The string of the type to fix
 * @returns The string with the type fixed
 */
export function sanitizeParameterType(type: string): string {
  const regExp = new RegExp(`^(${userDefinedTypes.join('|')}) `);
  return type.replace(regExp, '');
}

/**
 * Explicits a type's storage location, if required
 * @param type The string of the type to explicit
 * @returns The string with the type explicit
 */
export function explicitTypeStorageLocation(type: string): string {
  const regExp = new RegExp(`^(${explicitTypes.join('|')})\\b`);
  if (regExp.test(type) || type.includes('[]')) {
    return `${type} memory`;
  } else {
    return type;
  }
}

/**
 * Registers the nested templates
 * @returns The content of the template
 */
export function getContractTemplate(): HandlebarsTemplateDelegate<any> {
  const templatePath = path.resolve(__dirname, 'templates', 'contract-template.hbs');
  const templateContent = readFileSync(templatePath, 'utf8');
  return Handlebars.compile(templateContent);
}

export function getSmockHelperTemplate(): HandlebarsTemplateDelegate<any> {
  const templatePath = path.resolve(__dirname, 'templates', 'helper-template.hbs');
  const templateContent = readFileSync(templatePath, 'utf8');
  return Handlebars.compile(templateContent);
}

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

export async function getSolidityFilesAbsolutePaths(cwd: string, directories: string[]): Promise<string[]> {
  // Map each directory to a glob promise, searching for .sol files
  const promises = directories.map(directory => glob(`${directory}/**/*.sol`, { cwd, ignore: [] }));
  const filesArrays = await Promise.all(promises);
  const files = filesArrays.flat();

  return files;
}

export async function readPartial(partialName: string): Promise<string> {
  const partialPath = path.resolve(__dirname, 'templates', 'partials', `${partialName}.hbs`);
  const partialContent = readFileSync(partialPath, 'utf8');
  return partialContent;
}

export function extractParameters(parameters: VariableDeclaration[]): { functionParameters: string[], parameterTypes: string[], parameterNames: string[] } {
  const functionParameters = parameters.map((parameter, index) => {
    const typeName: string = sanitizeParameterType(parameter.typeString);
    const paramName: string = parameter.name || `_param${index}`;
    const storageLocation = ['memory', 'calldata'].includes(parameter.storageLocation) ? `${parameter.storageLocation} ` : '';
    return `${typeName} ${storageLocation}${paramName}`;
  });

  const parameterTypes = parameters.map(parameter => sanitizeParameterType(parameter.typeString));
  const parameterNames = parameters.map((parameter, index) => parameter.name || `_param${index}`);

  return {
    functionParameters,
    parameterTypes,
    parameterNames
  }
}

export function extractReturnParameters(returnParameters: VariableDeclaration[]): { functionReturnParameters: string[], returnParameterTypes: string[], returnParameterNames: string[] } {
  const functionReturnParameters = returnParameters.map((parameter: VariableDeclaration, index: number) => {
    const typeName: string = sanitizeParameterType(parameter.typeString);
    const paramName: string = parameter.name || `_returnParam${index}`;
    const storageLocation = ['memory', 'calldata'].includes(parameter.storageLocation) ? `${parameter.storageLocation} ` : '';
    return `${typeName} ${storageLocation}${paramName}`;
  });

  const returnParameterTypes = returnParameters.map(parameter => sanitizeParameterType(parameter.typeString));
  const returnParameterNames = returnParameters.map((parameter, index) => parameter.name === '' ? `_returnParam${index}` : parameter.name);

  return {
    functionReturnParameters,
    returnParameterTypes,
    returnParameterNames
  }
}

export async function renderNodeMock(node: ASTNode): Promise<string> {
  const partial = partialName(node);
  if (partial === undefined) return '';
  const context = CONTEXT_RETRIEVERS[partial](node);
  // TODO: Handle a possible invalid partial name
  const partialContent = await readPartial(partial);
  const template = Handlebars.compile(partialContent);
  return template(context);
}

export function partialName(node: ASTNode): string {
  if (node instanceof VariableDeclaration) {
    if (node.typeString.startsWith('mapping')) {
      return 'mapping-state-variable';
    } else if (node.typeString.includes('[]')) {
      return 'array-state-variable';
    } else {
      return 'state-variable';
    }
  } else if (node instanceof FunctionDefinition) {
    if (node.isConstructor) {
      return 'constructor';
    } else if (node.visibility === 'external' || node.visibility === 'public') {
      return 'external-or-public-function';
    } else if (node.visibility === 'internal' && node.virtual) {
      return 'internal-function';
    }
  } else if (node instanceof ImportDirective) {
    return 'import';
  }

  // TODO: Handle unknown nodes
}

export async function getRemappings(rootPath: string): Promise<string[]> {
  // First try the remappings.txt file
  try {
    return await exports.getRemappingsFromFile(path.join(rootPath, 'remappings.txt'));
  } catch (e) {
    // If the remappings file does not exist, try foundry.toml
    try {
      return await exports.getRemappingsFromConfig(path.join(rootPath, 'foundry.toml'));
    } catch {
      return [];
    }
  }
}

export async function getRemappingsFromFile(remappingsPath: string): Promise<string[]> {
  const remappingsContent = await fs.readFile(remappingsPath, 'utf8');

  return remappingsContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length)
    .map((line) => sanitizeRemapping(line));
}

export async function getRemappingsFromConfig(foundryConfigPath: string): Promise<string[]> {
  const foundryConfigContent = await fs.readFile(foundryConfigPath, 'utf8');
  const regex = /remappings[\s|\n]*=[\s\n]*\[(?<remappings>[^\]]+)]/;
  const matches = foundryConfigContent.match(regex);
  if (matches) {
    return matches
      .groups!.remappings.split(',')
      .map((line) => line.trim())
      .map((line) => line.replace(/["']/g, ''))
      .filter((line) => line.length)
      .map((line) => sanitizeRemapping(line));
  } else {
    return [];
  }
}

export function sanitizeRemapping(line: string): string {
  // Make sure the key and the value both either have or don't have a trailing slash
  const [key, value] = line.split('=');
  const slashNeeded = key.endsWith('/');

  if (slashNeeded) {
    return value.endsWith('/') ? line : `${line}/`;
  } else {
    return value.endsWith('/') ? line.slice(0, -1) : line;
  }
}

export async function emptySmockDirectory(mocksDirectory: string) {
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
}

export async function getSourceUnits(rootPath: string, contractsDirectories: string[], ignoreDirectories: string[]): Promise<SourceUnit[]> {
  const solidityFiles: string[] = await getSolidityFilesAbsolutePaths(rootPath, contractsDirectories);
  const remappings: string[] = await getRemappings(rootPath);

  const compiledFiles = await compileSol(solidityFiles, 'auto', {
    basePath: rootPath,
    remapping: remappings,
    includePath: [rootPath],
  });

  const sourceUnits = new ASTReader()
    .read(compiledFiles.data, ASTKind.Any, compiledFiles.files)
    // Remove Solidity files from the ignored directories
    .filter(sourceUnit => !ignoreDirectories.some(directory => sourceUnit.absolutePath.includes(directory)));

  return sourceUnits;
}

export function smockableNode(node: ASTNode): boolean {
  if (node instanceof VariableDeclaration) {
    // If the state variable is constant then we don't need to mock it
    if (node.constant || node.mutability === 'immutable') return false;
    // If the state variable is private we don't mock it
    if (node.visibility === 'private') return false;
  } else if(!(node instanceof FunctionDefinition)) {
    // Only process variables and functions
    return false;
  }

  return true;
}
