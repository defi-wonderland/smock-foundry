pragma solidity ^0.8.0;

contract ContractD {
  uint256 internal _internalUintVar;

  constructor(uint256 _uintVariable) {
    _internalUintVar = _uintVariable;
  }

  function _setInternalUintVar(uint256 _uintVariable) internal virtual returns (bool, uint256, string memory) {
    _internalUintVar = _uintVariable;
    return (true, 111, 'test');
  }

  function _getVariables(uint256 _uintVariable) internal view virtual returns (bool, uint256, string memory) {
    return (true, 111, 'test');
  }

  function _internalFuncNoInputNoOutput() internal virtual {
    _internalUintVar = 11;
  }

  function _internalViewFuncNoInputNoOutput() internal view virtual {
    uint256 __internalUintVar = _internalUintVar;
  }
}
