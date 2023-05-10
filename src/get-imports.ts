import fs from "fs";

export const getImports = async (sourceFilePath: string): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    fs.readFile(sourceFilePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const importRegex = /import\s+{([^}]+)}\s+from\s+(['"])([^'"]+)(['"]);/g;
      const matches = data.match(importRegex) || [];

      resolve(matches);
    });
  });
};
