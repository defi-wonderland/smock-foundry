import {
  getFunctions,
  getContractPaths,
  getConstructor,
  getImports,
  Ast,
} from "./index";
import { ethers } from "ethers";
import { Interface } from "@ethersproject/abi";
import { getSubDirNameFromPath } from "./utils";
import Handlebars from "handlebars";
import { readFileSync, writeFileSync } from "fs";
import { ensureDir, emptyDir } from "fs-extra";

export const generateMockContracts = async () => {
  // Compile handlebars template
  const templateContent = readFileSync(
    'templates/mockContractTemplate.hbs',
    'utf8'
  );
  const template = Handlebars.compile(templateContent);

  // Output path
  // TODO: Make this configurable
  const mockContractsDir = './solidity/mockContracts';

  try {
    try {
      await ensureDir(mockContractsDir)
    } catch (error) {
      console.error('Error while creating the mock directory: ', error);
    }

    // Empty the directory, if it exists
    try {
      await emptyDir(mockContractsDir);
    } catch (error) {
      console.error('Error while trying to empty the mock directory: ', error);
    }
    // Get all contracts directories
    const contractPaths: string[] = getContractPaths();
    // Loop for each contract path
    contractPaths.forEach(async (contractPath: string) => {
      // Get the sub dir name
      const subDirName: string = getSubDirNameFromPath(contractPath);
      const compiledArtifactsPath = `../out/${contractPath}/${subDirName}`;
      // Get the contract name
      const contractName: string = subDirName.replace(".json", "");
      // Get the abi
      // TODO: add check that it exists
      const abi: any = require(compiledArtifactsPath).abi;
      // Get the ast
      // TODO: add check that it exists
      const ast: Ast = require(compiledArtifactsPath).ast;
      // Get the contract's interface
      const iface: Interface = new ethers.utils.Interface(abi);

      // All data which will be use for create the template
      const data = {
        contractName: contractName,
        import: getImports(ast),
        constructor: getConstructor(ast),
        functions: getFunctions(iface, contractPath.replace(".sol", "")),
      };


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
        `./solidity/mockContracts/Mock${contractName}.sol`,
        cleanedCode
      );
    });

    console.log("Mock contracts generated successfully");
  } catch (error) {
    console.log(error);
  }
};
