pragma solidity ^0.8.0;

interface IContractCA {
  // View
  function uint256Variable() external view returns (uint256);

  // Logic
  function setVariablesC(uint256 _newUint256) external returns (bool _result);
}
