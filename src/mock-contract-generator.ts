import {
  getExternalMockFunctions,
  getConstructor,
  getImports,
  getStateVariables,
  Ast,
} from "./index";
import { ethers } from "ethers";
import { Interface } from "@ethersproject/abi";
import { getSubDirNameFromPath, registerHandlebarsTemplates, getContractNames, compileSolidityFilesFoundry } from "./utils";
import Handlebars from "handlebars";
import { writeFileSync } from "fs";
import { ensureDir, emptyDir } from "fs-extra";
import { resolve } from 'path';
import { StateVariablesOptions, ContractDefinitionNode } from "./types";

/**
 * Generates the mock contracts
 * @param contractsDir The directory where the contracts are located
 * @param compiledArtifactsDir The directory where the compiled artifacts are located
 * @param generatedContractsDir The directory where the mock contracts will be generated
 */
export const generateMockContracts = async (contractsDir: string, compiledArtifactsDir: string, generatedContractsDir: string) => {
  const templateContent: string = registerHandlebarsTemplates();
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
      // Get the ast
      // TODO: add check that it exists
      const ast: Ast = require(compiledArtifactsPath).ast;
      // Check if the abi and ast exist
      if(!ast) return;

      // Get the contract node and check if it's a library
      // TODO: check what happens if there are more than 1 contracts in a single file
      const contractNode = ast.nodes.find(
        (node) => node.nodeType === "ContractDefinition"
      ) as ContractDefinitionNode;
      if(!contractNode || contractNode.contractKind === 'library') return;

      const functions: StateVariablesOptions = getStateVariables(contractNode);
      // All data which will be use for create the template
      const data = {
        contractName: contractName,
        contractsDir: contractsDir,
        import: getImports(ast),
        constructor: getConstructor(contractNode),
        mockExternalFunctions: getExternalMockFunctions(contractNode),
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
        .replace(/&#x3D;/g, "=")
        .replace(/;;/g, ";");

      // Write the contract
      writeFileSync(
        `${generatedContractsDir}/Mock${contractName}.sol`,
        cleanedCode
      );
    });

    console.log("Mock contracts generated successfully");
    // Compile the mock contracts
    compileSolidityFilesFoundry(generatedContractsDir);
  } catch (error) {
    console.log(error);
  }
};
