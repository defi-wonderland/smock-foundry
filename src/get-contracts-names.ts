import { promises as fsPromises } from 'fs';

export const getContractsNames = async (): Promise<string[]> => {
  // Dir of the contracts
  const targetDir = "./solidity/contracts";
  // Get all contracts dir
  const contractDirs = await fsPromises.readdir(targetDir);

  if (!contractDirs || contractDirs.length === 0) {
    throw new Error(`Invalid target directory: ${targetDir}`);
  }

  return contractDirs;
};
