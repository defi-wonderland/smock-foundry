pragma solidity ^0.8.0;

interface IContractB {
  // View
  function stringVariable() external view returns (string memory);

  // Logic
  function setVariablesB(string memory _newString) external returns (bool _result);
}
