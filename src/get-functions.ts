import { FunctionFragment, Interface, Fragment } from "@ethersproject/abi";
import { OutputType } from "./index";
import { capitalizeFirstLetter, typeFix } from "./utils";
import { BasicStateVariableOptions, BasicStateVariableSetOptions, BasicStateVariableMockOptions, ExternalFunctionOptions } from "./types";

/**
 * Returns an array BasicStateVariableOptions that contains the information to pass to the handlebars template
 * @param iface The interface of the contract
 * @param contractName The name of the contract
 * @returns An array of BasicStateVariableOptions
 */
export const getBasicStateVariablesMockFunctions = (
  iface: Interface,
  contractName: string
): BasicStateVariableOptions[] => {
  const functions: BasicStateVariableOptions[] = [];
  const fragments = iface.fragments.filter(
    (fragment) => fragment.type === "function"
  ) as Fragment[];

  fragments.forEach((func: FunctionFragment) => {
    if (func.stateMutability === "view") {
      const viewFunc = getBasicStateVariableFunctions(iface, contractName, func);
      if (viewFunc) 
        functions.push({ setFunction: viewFunc.setFunction, mockFunction: viewFunc.mockFunction});
    }
  });

  return functions;
};

/**
 * Returns an array ExternalFunctionOptions that contains the information to pass to the handlebars template
 * @param iface The interface of the contract
 * @param contractName The name of the contract
 * @returns An array of ExternalFunctionOptions
 */
export const getExternalMockFunctions = (
  iface: Interface,
  contractName: string
): ExternalFunctionOptions[] => {
  const functions: ExternalFunctionOptions[] = [];
  // Get all the functions
  const fragments = iface.fragments.filter(
    (fragment) => fragment.type === "function"
  ) as Fragment[];

  fragments.forEach((func: FunctionFragment) => {
    // Get the external and payable functions
    if (
      func.stateMutability === "nonpayable" ||
      func.stateMutability === "payable"
    ) {
      // Get the current function
      const externalFunc = getExternalFunction(iface, contractName, func);
      functions.push(externalFunc);
    }
  });

  return functions;
};

/**
 * From view functions we only want to get the state variables to mock, since other view functions are not needed
 * @param iface The interface of the contract
 * @param contractName The name of the contract
 * @param functionName The name of the function
 * @returns A BasicStateVariableOptions object that has the information to pass to the handlebars template
 */
function getBasicStateVariableFunctions(
  iface: Interface,
  contractName: string,
  functionFragment: FunctionFragment
): BasicStateVariableOptions {
  let functionSignature: string = functionFragment.name;
  if(functionFragment.inputs.length) {
    const functionParamTypes: string = functionFragment.inputs.map((input) => input.type).join(', ');
    functionSignature = `${functionSignature}(${functionParamTypes})`;
  }
  // Get the current function
  const getFunction: FunctionFragment = iface.getFunction(functionSignature);
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

    // Save the set function information
    const setFunction: BasicStateVariableSetOptions = {
      functionName: capitalizeFirstLetter(functionFragment.name),
      paramType: type,
      paramName: functionFragment.name,
    };
    // Save the mock function information
    const mockFunction: BasicStateVariableMockOptions = {
      functionName: functionFragment.name,
      paramType: type,
      contractName: contractName
    };
    // Save the state variable information
    const stateVariable: BasicStateVariableOptions = {
      setFunction: setFunction,
      mockFunction: mockFunction
    };

    return stateVariable;
  }
}

/**
 * Returns an ExternalFunctionOptions object that has the information to pass to the handlebars template
 * @param iface The interface of the contract
 * @param contractName The name of the contract
 * @param functionFragment The function fragment returned by ethers
 * @returns An ExternalFunctionOptions object
 */
function getExternalFunction(
  iface: Interface,
  contractName: string,
  functionFragment: FunctionFragment
): ExternalFunctionOptions {
  let functionSignature: string = functionFragment.name;
  if(functionFragment.inputs.length) {
    const functionParamTypes: string = functionFragment.inputs.map((input) => input.type).join(', ');
    functionSignature = `${functionSignature}(${functionParamTypes})`;
  }
  // Get the current function
  const getFunction = iface.getFunction(functionSignature);

  // inputsString contains the input params with their types
  let inputsString: string;
  // inputsStringNames contains the input params names
  let inputsStringNames: string;
  // Check if there are inputs
  if(getFunction.inputs.length) {
    // Gets inputs name and type
    const inputsMap = getFunction.inputs.map((input) => ({
      name: input.name,
      type: input.type,
    }));

    // Create the inputs string checking type
    inputsString = inputsMap
      .map((input) => {
        return `${typeFix(input.type)} ${input.name}`;
      })
      .join(", ");

    // Create inputs params, basically just the names
    inputsStringNames = inputsMap.map((input) => input.name).join(", ");
  }else{
    inputsStringNames = '';
  }

  // outputsString contains the output params with their types
  let outputsString: string;
  // outputsStringNames contains the output params names
  let outputsStringNames: string;
  // checks if there are outputs
  if(getFunction.outputs.length) {
    // If there is an output, we will have to add a , to the end of the input string
    inputsString = inputsString + ", ";

    // Gets outputs name and type
    const outputsMap = getFunction.outputs.map((output) => ({
      name: output.name,
      type: output.type,
    }));

    // Create the outputs string checking type
    outputsString = outputsMap
      .map((output) => {
        return `${typeFix(output.type)} ${output.name}`;
      })
      .join(", ");

    // Create outputs params, basically just the names
    outputsStringNames = outputsMap.map((output) => output.name).join(", ");
  }else {
    outputsStringNames = '';
  }
  // Save the external function information
  const getExternalMockFunction: ExternalFunctionOptions = {
    functionName: functionFragment.name,
    inputsString: inputsString,
    outputsString: outputsString,
    contractName: contractName,
    inputsStringNames: inputsStringNames,
    outputsStringNames: outputsStringNames
  };

  return getExternalMockFunction;
}
