pragma solidity ^0.8.0;

import {IContractB} from '../interfaces/IContractB.sol';

contract ContractB is IContractB {
  string public stringVariable;

  function setVariablesB(string memory _stringVariable) public returns (bool _result) {
    stringVariable = _stringVariable;
    _result = true;
  }
}
