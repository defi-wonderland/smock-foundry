pragma solidity ^0.8.0;

import {Greeter} from 'contracts/Greeter.sol';
import {IERC20} from 'lib/isolmate/src/interfaces/tokens/IERC20.sol';
import {IGreeter} from 'solidity/interfaces/IGreeter.sol';

contract mockGreeter is Greeter {
  constructor(string memory _greeting, IERC20 _token) Greeter(_greeting, _token) {}
}
