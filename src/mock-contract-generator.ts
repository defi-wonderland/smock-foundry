import { parseContract, getContractsNames, getConstructor } from "./index";
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

      const { viewFunctions, externalFunctions } = await parseContract(abi);
      const data = {
        contractName: contractNames.replace(".sol", ""),
        constructor: await getConstructor(contractDir),
        viewFunctions: viewFunctions,
        externalFunctions: externalFunctions,
      };

      // Fill the template with the data
      const template = Handlebars.compile(templateContent);

      // Fill the template with the data
      const code = template(data);

      const cleanedCode = code.replace(/&#x3D;/g, "=");

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
