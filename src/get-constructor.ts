const fs = require("fs");

export const getConstructor = async (
  sourceFilePath: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(sourceFilePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const constructorStart = data.indexOf("constructor(");
      const constructorEnd = data.indexOf("}", constructorStart);

      resolve(data.slice(constructorStart, constructorEnd + 1));
    });
  });
};
