import Handlebars from 'handlebars';
import { VariableDeclaration, FunctionDefinition, ImportDirective, ASTNode } from 'solc-typed-ast';
import { userDefinedTypes, explicitTypes } from './types';
import { resolve } from 'path';
import { exec } from 'child_process';
import { readFileSync } from 'fs';
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
  return files.filter((file) => file.endsWith('.sol')).map((file) => resolve(file));
}

export async function readPartial(partialName: string): Promise<string> {
  const partialPath = resolve(__dirname, 'templates', 'partials', `${partialName}.hbs`);
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
    const paramName: string = parameter.name === '' ? `_returnParam${index}` : parameter.name;
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
