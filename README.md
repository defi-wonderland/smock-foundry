[![Version](https://img.shields.io/npm/v/@defi-wonderland/smock-foundry?label=Version)](https://www.npmjs.com/package/@defi-wonderland/smock-foundry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/defi-wonderland/prophet-sdk/blob/main/LICENSE)

# Smock Foundry
A plugin for [foundry](https://github.com/foundry-rs/foundry) that automatically generates Solidity mocks for every contract in your project.

## Features

- Get rid of your folder of "mock" contracts and **just use
  foundry**.
- Keep your tests **simple** with straightforward mock functions.
- Mock up external calls and internal variables in a beautiful and orderly fashion.

## Installation

You can install the plugin via yarn:

```bash
yarn add @defi-wonderland/smock-foundry --save-dev
```

## Basic Usage

### Creating mocks

To generate the mock contracts all you have to do is run:

```bash
yarn smock-foundry --contracts path/to/contracts
```

The `smock-foundry` command accepts the following options:

Option      | Default                           | Notes
------------|-----------------------------------|-------
`contracts` | —                                 | The path to the solidity contracts to mock
`out`       | `./out`                           | The path that has the compiled artifacts
`mocks `    | `./solidity/test/smock`           | The path to the generated mock contracts
`ignore`    | []                                | A list of directories to ignore, e.g. `--ignore libraries`

Be sure to `gitignore` the generated smock directory.

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

import { MockGreeter } from '/path/to/smock/contracts/MockGreeter.sol';
import { SmockHelper } from '/path/to/smock/SmockHelper.sol';

contract BaseTest is Test, SmockHelper {
  MockGreeter public greeter;

  function setUp() public {
    // The `deployMock` call is equivalent to
    // address _greeterAddress = address(new MockGreeter('Hello'));
    // vm.label(_greeterAddress, 'Greeter');
    // vm.allowCheatcodes(_greeterAddress);
    // return _greeterAddress;

    greeter = MockGreeter(
      deployMock('Greeter', type(Greeter).creationCode, abi.encode('Hello'))
    );
  }
}
```

Then enjoy the wonders of mocking:

```solidity
// Mock the `greet` function to return 'Hola' instead of 'Hello'
greeter.mock_call_greet('Hola');

// Or you can achieve the same by setting the internal variable
greeter.set__greeting('Hola');
```

### Gotchas

- Please, note that if you want to mock `internal` functions, you **must** make them `virtual`. The tool will not generate mocks for internal functions that are not virtual.
- Cannot set `private` variables and mock `private` functions.
- Mocking of structs containing mappings is not supported.

# Licensing

The primary license for Smock Foundry is MIT, see [`LICENSE`](./LICENSE).

# Contributors

Maintained with love by [Wonderland](https://defi.sucks). Made possible by viewers like you.
