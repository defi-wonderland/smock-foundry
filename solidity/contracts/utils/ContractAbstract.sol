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
  function undefinedFuncNoInputNoOutput() public virtual;

  function undefinedViewFunc(string memory _someText) public view virtual returns (bool _result);
  function undefinedViewFuncNoInputNoOutput() public view virtual;

  function _undefinedInternalFunc(string memory _someText) internal virtual returns (bool _result);
  function _undefinedInternalFuncNoInputNoOutput() internal virtual;

  function _undefinedInternalViewFunc(string memory _someText) internal view virtual returns (bool _result);
  function _undefinedInternalViewFuncNoInputNoOutput() internal view virtual;
}
