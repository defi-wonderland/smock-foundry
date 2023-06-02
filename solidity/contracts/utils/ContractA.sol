pragma solidity ^0.8.0;

import {IContractA} from '../../interfaces/IContractA.sol';
import {IContractZ} from '../../interfaces/IContractZ.sol';
import {ContractB} from './ContractB.sol';

contract ContractA is IContractA, ContractB {
  uint256 public uintVariable;

  /// Constructor
  constructor(uint256 _uintVariable) ContractB() {
    uintVariable = _uintVariable;
  }

  function setVariablesA(uint256 _newValue) public returns (bool _result) {
    uintVariable = _newValue;
    _result = true;
  }
}

contract ContractZ is IContractZ {
  uint256 public uintVariable;
}
