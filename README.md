[![Version](https://img.shields.io/npm/v/@defi-wonderland/foundry-mock-generator?label=Version)](https://www.npmjs.com/package/@defi-wonderland/foundry-mock-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/defi-wonderland/prophet-sdk/blob/main/LICENSE)

# Foundry Mock Generator
A plugin for [foundry](https://github.com/foundry-rs/foundry) that automatically generates Solidity mocks for every contract in your project.

## Features

- Get rid of your folder of "mock" contracts and **just use
  foundry**.
- Keep your tests **simple** with straightforward mock functions.
- Mock up external calls and internal variables in a beautiful and orderly fashion.

## Installation

You can install the plugin via yarn:

```bash
yarn add @defi-wonderland/foundry-mock-generator --save-dev
```

## Basic Usage

### Creating mocks

To generate the mock contracts all you have to do is run:

```bash
yarn foundry-mock-generator --contracts path/to/contracts
```

The `foundry-mock-generator` command accepts the following options:

Option      | Default                           | Notes
------------|-----------------------------------|-------
`contracts` | —                                 | The path to the solidity contracts to mock
`out`       | `./out`                           | The path that has the compiled artifacts
`genDir`    | `./solidity/test/mock-contracts`  | The path to the generated mock contracts
`ignore`    | []                                | A list of directories to ignore, e.g. `--ignore libraries`

### Using mocks

Let's say you have a `Greeter` contract in your project at `contracts/Greeter.sol`:

```solidity
contract Greeter {
  string internal _greeting;

  constructor(string memory greeting) {
    _greeting = greeting;
  }

  function greet() public view returns (string memory) {
    return _greeting;
  }
}
```

After running the generator, you will have a mock contract located at `${genDir}/contracts/MockGreeter.sol`:

```solidity
contract MockGreeter is Greeter {
  function mock_call_greet(string memory __greeting) external {
    // Mocks the greet() function calls
  }

  function set__greeting(string memory greeting) public {
    // Sets the value of `greeting`
  }
}
```

The next step would be importing the mock contract in your unit tests, deploying it and allowing it to use the cheatcodes, specifically `vm.mockCall`.

```solidity
import 'forge-std/Test.sol';

import { MockGreeter } from '/path/to/mock-contracts/MockGreeter.sol';
import { MockHelper } from '/path/to/mock-contracts/MockHelper.sol';

contract BaseTest is Test, MockHelpers {
  MockGreeter public greeter;

  function setUp() public {
    // The `deployMock` call is equivalent to
    // greeter = new MockGreeter('Hello');
    // label(address(greeter, 'Greeter');
    // vm.allowCheatcodes(address(greeter);

    greeter = deployMock(
      'Greeter',
      type(Greeter).creationCode,
      abi.encode('Hello')
    );
  }
}
```

Then enjoy the wonders of mocking:

```solidity
// Mock the `greet` function to return 'Holá' instead of 'Hello'
greeter.mock_call_greet('Holá');

// Or you can achieve the same by setting the internal variable
greeter.set__greeting('Holá');
```

### Gotchas

- Please, note that if you want to mock `internal` functions, you **must** make them `virtual`. The tool will not generate mocks for internal functions that are not virtual.
- Cannot `set` private variables and mock private functions.
- If you have a contract named `Helper`, you can avoid the name collision like so:

```solidity
import { MockHelper } from '/path/to/mock-contracts/contracts/MockHelper.sol';
import { MockHelper as FoundryMockHelper } from '/path/to/mock-contracts/MockHelper.sol';

contract BaseTest is Test, FoundryMockHelper {
  // You get the idea
}
```

## Release

We use changesets to mark packages for new releases. When merging commits to the dev branch you MUST include a changeset file if your change would require that a new version of a package be released.

To add a changeset, run the command `yarn changeset` in the root of this repo. You will be presented with a small prompt to select the packages to be released, the scope of the release (major, minor, or patch), and the reason for the release. Comments within changeset files will be automatically included in the changelog of the package.

# Licensing

The primary license for the mock generator is MIT, see [`LICENSE`](./LICENSE).

# Contributors

Maintained with love by [Wonderland](https://defi.sucks). Made possible by viewers like you.
