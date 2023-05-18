import { FunctionFragment, ethers } from "ethers";
import { memoryTypes, OutputType } from "./index";

export const parseContract = async (
  abi: any[],
  interfaceName: string
): Promise<{
  allFunctions: string;
}> => {
  // Interface
  const iface = new ethers.Interface(abi);

  // Array with functions
  const functions: string[] = [];

  // Array with external/public functions frangments
  const fragments = iface.fragments.filter(
    (fragment) => fragment.type === "function"
  );

  // Loop every function
  fragments.forEach((func: FunctionFragment) => {
    // Get the view functions
    if (func.stateMutability === "view") {
      // Get the current function
      const getFunction = iface.getFunction(func.name);

      // Get the output type
      const outputs: OutputType[] = [...getFunction.outputs];

      // If name === 0 means that its a variable and not a function
      if (outputs[0].name === "") {
        const functionName = getFunction.name.toLowerCase();

        // Check if type needs memory
        const type = outputs.map((output) => {
          let type = output.type;
          if (memoryTypes.includes(output.type)) {
            type = `${output.type} memory`;
          }
          return `${type}${output.name}`;
        });

        // Craft the string for mock and setter
        const viewFunc = `
          function mock_set${capitalizeFirstLetter(
            func.name
          )}(${type} _${functionName}) public {
            stdstore.target(address(this)).sig('${
              func.name
            }()').checked_write(_${functionName});
          }
          
          function mock_${func.name}(${type} _${functionName}) public {
            vm.mockCall(
            address(this),
            abi.encodeWithSelector(I${interfaceName}.${func.name}.selector),
            abi.encode(_${functionName})
            );
          }`;

        // Push to view functions array
        functions.push(viewFunc);
      }
    }

    // Get the external and payable functions
    if (
      func.stateMutability === "nonpayable" ||
      func.stateMutability === "payable"
    ) {
      // Get the current function
      const getFunction = iface.getFunction(func.name);

      // Get inputs
      const inputsMap = getFunction.inputs.map((input) => ({
        name: input.name,
        type: input.type,
      }));

      // Create the inputs string checking type
      const inputsString = inputsMap
        .map((output) => {
          let type = output.type;
          if (memoryTypes.includes(output.type)) {
            type = `${output.type} memory`;
          }
          return `${type} ${output.name}`;
        })
        .join(", ");

      // Create inputs params
      const inputsStringParam = inputsMap.map((input) => input.name).join(", ");

      // Gets outputs
      const outputsMap = getFunction.outputs.map((output) => ({
        name: output.name,
        type: output.type,
      }));

      // Create the outputs string checking type
      const outputsString = outputsMap
        .map((output) => {
          let type = output.type;
          if (memoryTypes.includes(output.type)) {
            type = `${output.type} memory`;
          }
          return `${type} ${output.name}`;
        })
        .join(", ");

      // Create outputs params
      let outputsStringParam = outputsMap
        .map((output) => output.name)
        .join(", ");

      // Checks abi encode
      if (outputsStringParam === "") {
        outputsStringParam = "''";
      }

      // Craft the string for mock
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

  // Concat all the functions
  const allFunctions = functions.join("\n");
  return { allFunctions };
};

// Function to capitalize first letter
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
