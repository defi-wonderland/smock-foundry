**Foundrock** is the solidity **mock**ing library. It's a plugin for
[foundry](https://github.com/foundry-rs/foundry) that can be used to create mock Solidity
contracts able to mock variables and external calls. With Smock, it's
easier than ever to test your smart contracts with foundry.

# Features

- Get rid of your folder of "mock" contracts and **just use
  foundry**.
- Keep your tests **simple** with a easy mock functions.
- Mock up external calls and variables in a beautiful and orderly fashion.

# Documentation

# Quick Start

## Installation

You can install Foundrock via npm or yarn:

```console

```

## Basic Usage

Foundrock is dead simple to use. Here's a basic example of how you might use
it to streamline your tests.

```typescript

abstract contract Base is DSTestPlus, TestConstants {
  MockContract public mock_myContract = MockContract(mockContract(newAddress(), 'mockContract'));
}
  contract UnitFunctioName is Base {

    function test(uint256 _x, string _y, bool _z) public {
    /// Mock-call in tests
    mock_myContract.mock_myFunc(_x, _y, _z);

    /// Mock-var in tests
    mock_myContract.mock_myVar(method_x, y);
  }
}
```

# License

Foundrock is released under the MIT license. Feel free to use, modify,
and/or redistribute this software as you see fit. See the
[LICENSE](https://github.com/defi-wonderland/smock/blob/main/LICENSE)
file for more information.

# Contributors

Maintained with love by [Wonderland](https://defi.sucks). Made possible by viewers like you.
