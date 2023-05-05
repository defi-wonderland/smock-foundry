import fs from "fs";

export const getContractsDirs = async (): Promise<string[]> => {
  const dirs = await fs.promises.readdir("./out", { withFileTypes: true });
  const contractDirs = dirs
    .filter(
      (dir) =>
        dir.isDirectory() &&
        dir.name.startsWith("I") &&
        !dir.name.includes("ERC")
    )
    .map((dir) => dir.name);

  return contractDirs;
};
