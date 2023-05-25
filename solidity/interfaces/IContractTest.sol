pragma solidity ^0.8.0;

interface IContractTest {
  // View
  function uintVariable() external view returns (uint256);
  function stringVariable() external view returns (string memory);
  function boolVariable() external view returns (bool);
  function addressVariable() external view returns (address);
  function bytes32Variable() external view returns (bytes32);
  function addressArray(uint256) external view returns (address);
  function uint256Array(uint256) external view returns (uint256);
  function bytes32Array(uint256) external view returns (bytes32);
  function uint256ToAddress(uint256) external view returns (address);
  function addressToUint(address) external view returns (uint256);
  function bytes32ToBytes(bytes32) external view returns (bytes memory);

  // Logic
  function setVariables(
    uint256 _newValue,
    string memory _newString,
    bool _newBool,
    address _newAddress,
    bytes32 _newBytes32,
    address[] memory _addressArray,
    uint256[] memory _uint256Array,
    bytes32[] memory _bytes32Array
  ) external returns (bool _result);
}
