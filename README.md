**Foundry Mock Generator** is the solidity **mock**ing library. It's a plugin for
[foundry](https://github.com/foundry-rs/foundry) that can be used to create mock Solidity
contracts able to mock variables and external calls.

# Features

- Get rid of your folder of "mock" contracts and **just use
  foundry**.
- Keep your tests **simple** with a easy mock functions.
- Mock up external calls and variables in a beautiful and orderly fashion.

## Installation

You can install the tool via yarn:

```bash
yarn add foundry-mock-generator@<latest-canary>
```

## Basic Usage

To generate the mock contracts all you have to do is run:

```bash
yarn foundry-mock-generation --contractsDir <path/to/contracts> --outDir <path/to/foundry/out> --genDir <path/to/generate/contracts>
```

Note: --genDir default path is `solidity/test/mock-contracts`
Note: --outDir default path is `out`

1) To use the mock contracts in your tests just import them.

`import { MockMyContractName } from '/path/to/mock-contracts/MockMyContractName.sol'`

2) To mock a function or variable e.g.:

```
/// Deploy mock contract
mock_myContract = new MockMyContractname(...);
/// Mock myFuncName function, when called with `arg1`, `arg2` to return `return1`
mock_myContract.mock_myFuncName(arg1, arg2, return1);
/// Mock myVarName variable, to return `return1`
mock_myContract.mock_myVarName(return1);
```

# Contributors

Maintained with love by [Wonderland](https://defi.sucks). Made possible by viewers like you.
