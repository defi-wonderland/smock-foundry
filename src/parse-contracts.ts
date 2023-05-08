import { ConstructorFragment, FunctionFragment, ethers } from "ethers";

export const parseContract = async (
  abi: any[]
): Promise<{
  viewFunctions: FunctionFragment[];
  externalFunctions: FunctionFragment[];
}> => {
  const iface = new ethers.Interface(abi);

  // Gets the interface

  const viewFunctions: FunctionFragment[] = []; // Array with view functions frangments
  const externalFunctions: FunctionFragment[] = [];

  // Array with external/public functions frangments
  const functions = iface.fragments.filter(
    (fragment) => fragment.type === "function"
  );

  // Gets view functions
  functions.forEach((func: FunctionFragment) => {
    if (func.stateMutability === "view") {
      const inputs = iface.getFunction(func.name);
      viewFunctions.push(func);
    }

    if (
      func.stateMutability === "nonpayable" ||
      func.stateMutability === "payable"
    ) {
      externalFunctions.push(func);
    }
  });
  return { viewFunctions, externalFunctions };
};
