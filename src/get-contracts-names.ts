import fs from "fs";

export const getContractsNames = async (): Promise<string[]> => {
  const targetDir = "./solidity/contracts";
  const contractDirs = await fs.promises.readdir(targetDir);
  return contractDirs;
};
