import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Returns the names of the contracts in the given directory and its subdirectories
 * @param contractsDir The directory where the contracts are located
 * @returns The names of the contracts in the given directory and its subdirectories
 */
export const getContractNames = (contractsDir: string) : string[] => {
  const contractFileNames: string[] = [];
  // Recursive function to traverse the directory and its subdirectories
  function traverseDirectory(currentPath: string) {
    const fileNames = readdirSync(currentPath);
    // Loop through the files and directories
    fileNames.forEach((fileName: string) => { 
      const filePath = join(currentPath, fileName);
      const stats = statSync(filePath);
      // If the file is a contract then we add it to the array, if it is a directory then we call the function again
      if (stats.isFile() && fileName.endsWith('.sol')) {
        contractFileNames.push(fileName);
      } else if (stats.isDirectory()) {
        traverseDirectory(filePath);
      }
    })
  }

  traverseDirectory(contractsDir);

  return contractFileNames;
};
