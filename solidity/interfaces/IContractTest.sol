pragma solidity ^0.8.0;

contract MyContract {}

interface IContractTest {
  // Structs
  struct MyStruct {
    uint256 value;
    string name;
  }

  // Enums
  enum MyEnum {
    A,
    B,
    C
  }

  // View
  function uintVariable() external view returns (uint256);
  function stringVariable() external view returns (string memory);
  function boolVariable() external view returns (bool);
  function addressVariable() external view returns (address);
  function bytes32Variable() external view returns (bytes32);
  function myStructVariable() external view returns (uint256, string memory);
  function myEnumVariable() external view returns (MyEnum);
  function myContractVariable() external view returns (MyContract);
  function addressArray(uint256) external view returns (address);
  function uint256Array(uint256) external view returns (uint256);
  function bytes32Array(uint256) external view returns (bytes32);
  function myStructArray(uint256) external view returns (uint256, string memory);
  function uint256ToAddress(uint256) external view returns (address);
  function addressToUint(address) external view returns (uint256);
  function bytes32ToBytes(bytes32) external view returns (bytes memory);
  function uint256ToMyStruct(uint256) external view returns (uint256, string memory);
  function uint256ToAddressArray(uint256, uint256) external view returns (address);
  function uint256ToAddressToBytes32(uint256, address) external view returns (bytes32);
  function immutableUintVariable() external view returns (uint256);
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

  function setVariables(uint256) external returns (bool);

  function setVariables(uint256, bool) external returns (bool);

  function testFunc(uint256) external returns (bool);
}
