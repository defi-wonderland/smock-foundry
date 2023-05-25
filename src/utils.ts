export const getSubDirNameFromPath = (path: string): string => {
  // Split the path by the slash
  const pathSegments: string[] = path.split('/');
  // Get the last file
  const lastFile: string = pathSegments[pathSegments.length - 1];
  // Get the subDir name
  const subDir: string = lastFile.replace(".sol", ".json")
  return subDir;
}
  