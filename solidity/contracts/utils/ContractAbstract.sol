pragma solidity ^0.8.0;

abstract contract ContractAbstract {
  uint256 public uintVariable;

  constructor(uint256 _uintVariable) {
    uintVariable = _uintVariable;
  }

  function setVariablesA(uint256 _newValue) public returns (bool _result) {
    uintVariable = _newValue;
    _result = true;
  }

  function undefinedFunc(string memory _someText) public virtual returns (bool _result);
  function undefinedFuncNoReturn(string memory _someText) public virtual;
}
