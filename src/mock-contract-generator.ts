import {
  parseContract,
  getContractsNames,
  getConstructor,
  getImports,
} from "./index";
import Handlebars from "handlebars";
import fs from "fs";
import fsExtra from "fs-extra";

export const generateMockContracts = async () => {
  // Compile handlebars template
  const templateContent = fs.readFileSync(
    "templates/mockContractTemplate.hbs",
    "utf8"
  );

  // Output path
  const mockContractsDir = "./solidity/mockContracts";

  try {
    // Check if folder already exists
    if (!fs.existsSync(mockContractsDir)) {
      fs.mkdirSync(mockContractsDir);
    }

    // Delete the contents of the output directory
    await fsExtra.emptyDir(mockContractsDir);
    // Get contracts dir
    const contractDirs = await getContractsNames();
    // Loop for each contract
    contractDirs.forEach(async (contractNames: string) => {
      // Replace .sol for .json
      const subDir = contractNames.replace(".sol", ".json");
      // Gets the abi
      const abiFile = `../out/${contractNames}/${subDir}`;
      const abi = require(abiFile).abi;

      // All data which will be use for create the template
      const data = {
        contractName: contractNames.replace(".sol", ""),
        import: await getImports(abiFile),
        constructor: await getConstructor(abiFile),
        functions: await parseContract(abi, contractNames.replace(".sol", "")),
      };

      // Fill the template with the data
      const template = Handlebars.compile(templateContent);

      // Fill the template with the data
      const code = template(data);

      const cleanedCode = code
        .replace(/&#x27;/g, "'")
        .replace(/&#x3D;/g, "=")
        .replace(/;;/g, ";");

      // Write the contract
      await fs.promises.writeFile(
        `./solidity/mockContracts/Mock${contractNames}`,
        cleanedCode
      );
    });

    console.log("Mock contracts generated successfully");
  } catch (error) {
    console.log(error);
  }
};
