import { parseContract, getContractsDirs } from "./index";
import Handlebars from "handlebars";
import fs from "fs";

export const generateMockContracts = async () => {
  // Compile handlebars template
  const source = fs.readFileSync("templates/mockContractTemplate.hbs", "utf8");
  const template = Handlebars.compile(source);
  // path
  const mockContractsDir = "./solidity/mockContracts";

  try {
    // Checks if folder already exists
    if (!fs.existsSync(mockContractsDir)) {
      fs.mkdirSync(mockContractsDir);
    }

    const contractDirs = await getContractsDirs();

    contractDirs.forEach(async (contractDir: string) => {
      // Delete I as first element
      const subNameDir = contractDir.substring(1);
      // Replace .sol for .json
      const subDir = contractDir.replace(".sol", ".json");
      // Gets the abi
      const abiFile = `../out/${contractDir}/${subDir}`;
      const abi = require(abiFile).abi;

      const data = {
        contractName: subNameDir.replace(".sol", ""),
        functions: await parseContract(abi),
      };

      // Fill the template with the data
      const code = template(data);

      // Write the contract
      await fs.promises.writeFile(
        `./solidity/mockContracts/Mock${subNameDir}`,
        code
      );
    });

    console.log("Mock contracts generated successfully");
  } catch (error) {
    console.log(error);
  }
};
