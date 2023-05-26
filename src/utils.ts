import { arrayRegex, memoryTypes } from "./types";
import { resolve } from 'path';
import { readFileSync } from "fs";
import Handlebars from "handlebars";

/**
 * Given a path returns the name of the file with the extension replaced with .json
 * e.g. if the path is `contracts/MyContract.sol` it will return `MyContract.json`
 * @param path The path of the file
 * @returns The name of the file with the extension replaced with .json
 */
export const getSubDirNameFromPath = (path: string): string => {
  // Split the path by the slash
  const pathSegments: string[] = path.split("/");
  // Get the last file
  const lastFile: string = pathSegments[pathSegments.length - 1];
  // Get the subDir name
  const subDir: string = lastFile.replace(".sol", ".json");
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
 * @returns Returns the string with the type fixed
 */
export const typeFix = (str: string): string => {
  if (memoryTypes.includes(str) || arrayRegex.exec(str)) {
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
    const basicStateVariablesTemplatePath = resolve(__dirname, 'templates', 'mockBasicStateVariableTemplate.hbs');
    const arrayStateVariablesTemplatePath = resolve(__dirname, 'templates', 'mockArrayStateVariableTemplate.hbs');
    const mappingStateVariablesTemplatePath = resolve(__dirname, 'templates', 'mockMappingStateVariableTemplate.hbs');
    // Read the templates
    const templateContent = readFileSync(templatePath, 'utf8');
    const externalFuncsTemplateContent = readFileSync(externalFuncsTemplatePath, 'utf8');
    const basicStateVariablesTemplateContent = readFileSync(basicStateVariablesTemplatePath, 'utf8');
    const arrayStateVariablesTemplateContent = readFileSync(arrayStateVariablesTemplatePath, 'utf8');
    const mappingStateVariablesTemplateContent = readFileSync(mappingStateVariablesTemplatePath, 'utf8');
  
    // Register the partial templates
    Handlebars.registerPartial('mockStateVariable', basicStateVariablesTemplateContent);
    Handlebars.registerPartial('mockExternalFunction', externalFuncsTemplateContent);
    Handlebars.registerPartial('mockArrayStateVariable', arrayStateVariablesTemplateContent);
    Handlebars.registerPartial('mockMappingStateVariable', mappingStateVariablesTemplateContent);
    return templateContent;
}
