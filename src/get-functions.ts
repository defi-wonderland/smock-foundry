import { FunctionFragment, Interface, Fragment } from "@ethersproject/abi";
import { memoryTypes, OutputType } from "./index";

export const getFunctions = (iface: Interface, interfaceName: string): string => {
  // Array with functions
  const functions: string[] = [];
  // Array with external/public functions frangments
  const fragments = iface.fragments.filter(
    fragment => fragment.type === "function"
  ) as Fragment[];

  // Loop every function
  fragments.forEach((func: FunctionFragment) => {
    // Get the view functions
    if (func.stateMutability === "view") {
      // Get the current function
      const viewFunc = getViewFunction(iface, interfaceName, func.name);

      // Push to view functions array
      functions.push(viewFunc);
    }

    // Get the external and payable functions
    if (
      func.stateMutability === "nonpayable" ||
      func.stateMutability === "payable"
    ) {
      // Get the current function
      const externalFunc = getExternalFunction(iface, interfaceName, func.name);
      functions.push(externalFunc);
    }
  });

  // Concat all the functions
  const allFunctions = functions.join("\n");
  return allFunctions;
};

// Function to capitalize first letter
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getViewFunction(iface: Interface, interfaceName: string, funcionName: string): string {
  // Get the current function
  const getFunction: FunctionFragment = iface.getFunction(funcionName);

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
    const viewFunc = 
      `\tfunction mock_set${capitalizeFirstLetter(
        funcionName
      )}(${type} _${functionName}) public {\n` +
      `\t  stdstore.target(address(this)).sig('${
        funcionName
        }()').checked_write(_${functionName});\n` +
      `\t}\n\n` +
      
      `\tfunction mock_${funcionName}(${type} _${functionName}) public {\n` +
      `\t vm.mockCall(\n` +
      `\t  address(this),\n` +
      `\t  abi.encodeWithSelector(I${interfaceName}.${funcionName}.selector),\n` +
      `\t  abi.encode(_${functionName})\n` +
      `\t  );\n` +
      `\t}`;
    
    // Return the view function
    return viewFunc;
  }
}

function getExternalFunction(iface: Interface, interfaceName: string, funcionName: string): string {
  // Get the current function
  const getFunction = iface.getFunction(funcionName);

  // Get inputs
  const inputsMap = getFunction.inputs.map(({ name, type }) => ({
    name,
    type,
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
  const externalFunc = 
    `\tfunction mock_${funcionName}(${inputsString}${outputsString}) public {\n` +
    `\t  vm.mockCall(\n` +
    `\t    address(this),\n` +
    `\t    abi.encodeWithSelector(I${interfaceName}.${funcionName}.selector, ${inputsStringParam}),\n` +
    `\t    abi.encode(${outputsStringParam})\n` +
    `\t  );\n` +
    `\t}`;

  return externalFunc;
}