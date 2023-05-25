import { arrayRegex, memoryTypes } from "./types";

export const getSubDirNameFromPath = (path: string): string => {
  // Split the path by the slash
  const pathSegments: string[] = path.split("/");
  // Get the last file
  const lastFile: string = pathSegments[pathSegments.length - 1];
  // Get the subDir name
  const subDir: string = lastFile.replace(".sol", ".json");
  return subDir;
};

// Function to capitalize first letter
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Function to lower case first letter
export const lowercaseFirstLetter = (str: string): string => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

// Function to capitalize first letter
export const typeFix = (str: string): string => {
  if (memoryTypes.includes(str) || arrayRegex.exec(str)) {
    return `${str} memory`;
  } else {
    return str;
  }
};
