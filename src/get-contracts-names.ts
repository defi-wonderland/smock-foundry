import fs from "fs";

export const getContractsNames = async (): Promise<string[]> => {
  // Dir of the contracts
  const targetDir = "./solidity/contracts";
  // Get all contracts dir
  const contractDirs = await fs.promises.readdir(targetDir);

  return contractDirs;
};
