import {
  getDataFunctions,
  getFunctions,
  getContractNames,
  getConstructor,
  getImports,
  Ast,
} from "./index";
import { ethers } from "ethers";
import { Interface } from "@ethersproject/abi";
import { getSubDirNameFromPath, registerHandlebarsTemplates } from "./utils";
import Handlebars from "handlebars";
import { writeFileSync } from "fs";
import { ensureDir, emptyDir } from "fs-extra";
import { resolve } from 'path';

export const generateMockContracts = async (contractsDir: string, compiledArtifactsDir: string, generatedContractsDir: string) => {
  // Template path
  const templatePath = resolve(__dirname, 'templates', 'mockContractTemplate.hbs');
  // Read the template and compile it
  const templateContent = readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateContent);

  try {
    // Create the directory if it doesn't exist
    try {
      await ensureDir(generatedContractsDir)
    } catch (error) {
      console.error("Error while creating the mock directory: ", error);
    }

    // Empty the directory, if it exists
    try {
      await emptyDir(generatedContractsDir);
    } catch (error) {
      console.error("Error while trying to empty the mock directory: ", error);
    }
    console.log('Parsing contracts...');
    // Get all contracts directories
    const contractPaths: string[] = getContractNames(contractsDir);
    // Loop for each contract path
    contractPaths.forEach(async (contractPath: string) => {
      // Get the sub dir name
      // TODO: this assumes that the contract has the same name as the directory
      const subDirName: string = getSubDirNameFromPath(contractPath);
      const compiledArtifactsPath = resolve(compiledArtifactsDir, contractPath, subDirName);
      const contractName: string = subDirName.replace(".json", "");
      // Get the abi
      // TODO: add check that it exists
      const abi: any = require(compiledArtifactsPath).abi;
      // Get the ast
      // TODO: add check that it exists
      const ast: Ast = require(compiledArtifactsPath).ast;
      // Get the contract's interface
      const iface: Interface = new ethers.utils.Interface(abi);

      const mockStateVariables: BasicStateVariableOptions[] = getBasicStateVariablesMockFunctions(iface, contractName);
      const mockExternalFunctions: ExternalFunctionOptions[] = getExternalMockFunctions(iface, contractName);
      const mockArrayFunctions: BasicStateVariableOptions[] = getArrayFunctions(ast);
      const mockMappingFunctions: MappingStateVariableOptions[] = getMappingFunctions(ast);
      // All data which will be use for create the template
      const data = {
        contractName: contractName,
        import: getImports(ast),
        constructor: getConstructor(ast),
        mockStateVariables: mockStateVariables,
        mockExternalFunctions: mockExternalFunctions,
        mockArrayStateVariables: mockArrayFunctions,
        mockMappingStateVariables: mockMappingFunctions,
      };

      console.log(`Generating mock contract for ${contractName}...`);
      // Fill the handlebars template with the data
      const code: string = template(data);

      // some symbols seem to appear as unicode hex chars so replace them
      // TODO: check if there are other symbols we should account for, or if there is a better way to handle this
      const cleanedCode: string = code
        .replace(/&#x27;/g, "'")
        .replace(/&#x3D;/g, "=")
        .replace(/;;/g, ";");

      // Write the contract
      writeFileSync(
        `${generatedContractsDir}/Mock${contractName}.sol`,
        cleanedCode
      );
    });

    console.log("Mock contracts generated successfully");
  } catch (error) {
    console.log(error);
  }
};
