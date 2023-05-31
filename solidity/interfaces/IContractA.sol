pragma solidity ^0.8.0;

interface IContractA {
  // View
  function uintVariable() external view returns (uint256);

  // Logic
  function setVariablesA(uint256 _newValue) external returns (bool _result);
}
