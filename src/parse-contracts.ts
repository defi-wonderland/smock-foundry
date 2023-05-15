import { FunctionFragment, ethers } from "ethers";

export const parseContract = async (
  abi: any[],
  interfaceName: string
): Promise<{
  allFunctions: string;
}> => {
  const iface = new ethers.Interface(abi);

  // Gets the interface

  const functions: string[] = []; // Array with functions

  // Array with external/public functions frangments
  const fragments = iface.fragments.filter(
    (fragment) => fragment.type === "function"
  );

  // Gets view functions
  fragments.forEach((func: FunctionFragment) => {
    if (func.stateMutability === "view") {
      const getFunction = iface.getFunction(func.name);

      if (getFunction.outputs.length === 1) {
        const functionName = getFunction.name.toLowerCase();
        const type = getFunction.outputs.map((output) => {
          const type = output.type === "string" ? `string memory` : output.type;
          return `${type}${output.name}`;
        });
        const viewFunc = `
      function mock_${func.name}(${type} _${functionName}) public {
        stdstore.target(address(this)).sig('${func.name}()').checked_write(_${functionName});
      }`;
        functions.push(viewFunc);
      }
    }

    if (
      func.stateMutability === "nonpayable" ||
      func.stateMutability === "payable"
    ) {
      const getFunction = iface.getFunction(func.name);

      // Gets inputs
      const inputsMap = getFunction.inputs.map((input) => ({
        name: input.name,
        type: input.type,
      }));

      const inputsString = inputsMap
        .map((input) => {
          const type = input.type === "string" ? `string memory` : input.type;
          return `${type} ${input.name}`;
        })
        .join(", ");

      const inputsStringParam = inputsMap.map((input) => input.name).join(", ");

      // Gets outputs
      const outputsMap = getFunction.outputs.map((output) => ({
        name: output.name,
        type: output.type,
      }));

      const outputsString = outputsMap
        .map((output) => {
          const type = output.type === "string" ? `string memory` : output.type;
          return `${type} ${output.name}`;
        })
        .join(", ");

      let outputsStringParam = outputsMap
        .map((output) => output.name)
        .join(", ");

      // checks abi encode
      if (outputsStringParam === "") {
        outputsStringParam = "''";
      }

      const externalFunc = `
      function mock_${func.name}(${inputsString}${outputsString}) public {
        vm.mockCall(
          address(this),
          abi.encodeWithSelector(I${interfaceName}.${func.name}.selector, ${inputsStringParam}),
          abi.encode(${outputsStringParam})
        );
      }`;
      functions.push(externalFunc);
    }
  });
  const allFunctions = functions.join("\n");
  return { allFunctions };
};
