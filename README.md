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
yarn foundry-mock-generator --contracts <path/to/contracts> --out <path/to/foundry/out> --genDir <path/to/generate/contracts>
```

Note: --contracts required by the user, tha path to the solidity contracts to mock
Note: --genDir default path is `solidity/test/mock-contracts`, the path to generate the mock contracts
Note: --out default path is `out`, the path that has foundry's compiled artifacts

1. To use the mock contracts in your tests just import them

```JavaScript
import { MockMyContractName } from '/path/to/mock-contracts/MockMyContractName.sol'
```

2. Create the mock contract and allow cheatcodes for it

```JavaScript
/// Deploy mock contract
mock_myContract = new MockMyContractname(...);
/// Allow mocks for the contract
vm.allowCheatcodes(address(mock_myContract));
```

3. Enjoy of easy mock calls

```JavaScript
/// Mock myFuncName function, when called with `arg1`, `arg2` to return `return1`
mock_myContract.mock_call_myFuncName(arg1, arg2, return1);
/// Mock myVarName variable, to return `return1`
mock_myContract.mock_call_myVarName(return1);
```

4. You also can change value of any variable (except of `private`)

```JavaScript
/// Change value of a variable
mock_myContract.set_myVarName(value);
```

- Please, note that if you want to mock `internal` functions, you **must** make them `virtual`. The tool will not generate mocks for internal functions that are not virtual.

## Release

We use changesets to mark packages for new releases. When merging commits to the dev branch you MUST include a changeset file if your change would require that a new version of a package be released.

To add a changeset, run the command `yarn changeset` in the root of this repo. You will be presented with a small prompt to select the packages to be released, the scope of the release (major, minor, or patch), and the reason for the release. Comments within changeset files will be automatically included in the changelog of the package.

# Licensing

The primary license for Prophet contracts is MIT, see [`LICENSE`](./LICENSE).

# Contributors

Maintained with love by [Wonderland](https://defi.sucks). Made possible by viewers like you.
