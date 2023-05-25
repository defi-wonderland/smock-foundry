import { readdirSync } from 'fs';

export const getContractPaths = () : string[] => {
  // Dir of the contracts
  // TODO: Make this configurable
  const targetDir = "./solidity/contracts";
  // Get all contracts dir
  const contractPaths = readdirSync(targetDir);

  if (!contractPaths.length) {
    throw new Error(`Invalid target directory: ${targetDir}`);
  }

  return contractPaths;
};
