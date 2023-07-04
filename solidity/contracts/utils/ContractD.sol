pragma solidity ^0.8.0;

contract ContractD {
  uint256 internal _internalUintVar;

  function _setInternalUintVar(uint256 _stringVariable) internal virtual returns (bool, uint256, string memory) {
    _internalUintVar = _stringVariable;
    return (true, 111, 'test');
  }
}
