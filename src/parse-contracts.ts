import { FunctionFragment, ethers } from "ethers";

export const parseContract = async (
  abi: any[]
): Promise<FunctionFragment[]> => {
  const iface = new ethers.Interface(abi); // Gets the interface

  const viewFunctions: FunctionFragment[] = []; // Array with view functions frangments
  const externalFunctions: FunctionFragment[] = []; // Array with external/public functions frangments
  const functions = iface.fragments.filter(
    (fragment) => fragment.type === "function"
  );

  // Gets view functions
  functions.forEach((func: FunctionFragment) => {
    if (func.stateMutability === "view") {
      viewFunctions.push(func);
    }

    if (
      func.stateMutability === "nonpayable" ||
      func.stateMutability === "payable"
    ) {
      externalFunctions.push(func);
    }
  });

  return externalFunctions;
};
