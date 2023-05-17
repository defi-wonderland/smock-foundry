import {
  parseContract,
  getContractsNames,
  getConstructor,
  getImports,
} from "./index";
import Handlebars from "handlebars";
import fs from "fs";

export const generateMockContracts = async () => {
  // Compile handlebars template
  const templateContent = fs.readFileSync(
    "templates/mockContractTemplate.hbs",
    "utf8"
  );
  // path
  const mockContractsDir = "./solidity/mockContracts";

  try {
    // Checks if folder already exists
    if (!fs.existsSync(mockContractsDir)) {
      fs.mkdirSync(mockContractsDir);
    }

    const contractDirs = await getContractsNames();

    contractDirs.forEach(async (contractNames: string) => {
      // Get contractDir
      const contractDir = `./solidity/contracts/${contractNames}`;
      // Replace .sol for .json
      const subDir = contractNames.replace(".sol", ".json");
      // Gets the abi
      const abiFile = `../out/${contractNames}/${subDir}`;
      const abi = require(abiFile).abi;

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
