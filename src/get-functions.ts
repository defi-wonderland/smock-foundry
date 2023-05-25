import { FunctionFragment, Interface, Fragment } from "@ethersproject/abi";
import { OutputType } from "./index";
import { capitalizeFirstLetter, typeFix } from "./utils";

export const getFunctions = (
  iface: Interface,
  interfaceName: string
): string => {
  // Array with functions
  const functions: string[] = [];
  // Array with external/public functions frangments
  const fragments = iface.fragments.filter(
    (fragment) => fragment.type === "function"
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

function getViewFunction(
  iface: Interface,
  interfaceName: string,
  functionName: string
): string {
  // Get the current function
  const getFunction = iface.getFunction(functionName);
  // If the inputs have length, it means that it is either an array or a mapping, so skip that
  if (getFunction.inputs.length) {
    return;
  }

  // Get the output type
  const outputs: OutputType[] = [...getFunction.outputs];
  // If !name means that its a variable and not a function
  if (!outputs[0].name) {
    // Check if type needs memory

    const type = typeFix(outputs[0].type);

    // Craft the string for mock and setter
    const viewFunc =
      `\n` +
      `\tfunction mock_set${capitalizeFirstLetter(
        functionName
      )}(${type} _${functionName}) public {\n` +
      `\t  ${functionName} = _${functionName};\n` +
      `\t}` +
      `\n\n` +
      `\tfunction mock_${functionName}(${type} _${functionName}) public {\n` +
      `\t vm.mockCall(\n` +
      `\t  address(this),\n` +
      `\t  abi.encodeWithSelector(I${interfaceName}.${functionName}.selector),\n` +
      `\t  abi.encode(_${functionName})\n` +
      `\t  );\n` +
      `\t}`;

    // Return the view function
    return viewFunc;
  }
}

function getExternalFunction(
  iface: Interface,
  interfaceName: string,
  functionName: string
): string {
  // Get the current function
  const getFunction = iface.getFunction(functionName);

  // Get inputs
  const inputsMap = getFunction.inputs.map((input) => ({
    name: input.name,
    type: input.type,
  }));

  // Create the inputs string checking type
  let inputsString = inputsMap
    .map((input) => {
      return `${typeFix(input.type)} ${input.name}`;
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
      return `${typeFix(output.type)} ${output.name}`;
    })
    .join(", ");

  // If there is an output, we will have to add a , to the end of the input string
  if (outputsString !== "") {
    inputsString = inputsString + ", ";
  }

  // Create outputs params
  let outputsStringParam = outputsMap.map((output) => output.name).join(", ");

  // Checks abi encode
  if (outputsStringParam === "") {
    outputsStringParam = "''";
  }

  // Craft the string for mock
  const externalFunc =
    `\n` +
    `\tfunction mock_${functionName}(${inputsString}${outputsString}) public {\n` +
    `\t  vm.mockCall(\n` +
    `\t    address(this),\n` +
    `\t    abi.encodeWithSelector(I${interfaceName}.${functionName}.selector, ${inputsStringParam}),\n` +
    `\t    abi.encode(${outputsStringParam})\n` +
    `\t  );\n` +
    `\t}`;

  return externalFunc;
}
