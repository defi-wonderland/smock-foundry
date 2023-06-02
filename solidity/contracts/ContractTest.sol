pragma solidity ^0.8.0;

import {IContractTest} from '../interfaces/IContractTest.sol';

contract ContractTest is IContractTest {
  /// @inheritdoc IContractTest
  uint256 public uintVariable;
  /// @inheritdoc IContractTest
  string public stringVariable;
  /// @inheritdoc IContractTest
  bool public boolVariable;
  /// @inheritdoc IContractTest
  address public addressVariable;
  /// @inheritdoc IContractTest
  bytes32 public bytes32Variable;
  /// @inheritdoc IContractTest
  address[] public addressArray;
  /// @inheritdoc IContractTest
  uint256[] public uint256Array;
  /// @inheritdoc IContractTest
  bytes32[] public bytes32Array;
  /// @inheritdoc IContractTest
  mapping(uint256 => address) public uint256ToAddress;
  /// @inheritdoc IContractTest
  mapping(address => uint256) public addressToUint;
  /// @inheritdoc IContractTest
  mapping(bytes32 => bytes) public bytes32ToBytes;
  /// @inheritdoc IContractTest
  mapping(uint256 => mapping(address => bytes32)) public uint256ToAddressToBytes32;

  /// Constructor
  constructor(
    uint256 _uintVariable,
    string memory _stringVariable,
    bool _boolVariable,
    address _addressVariable,
    bytes32 _bytes32Variable
  ) {
    uintVariable = _uintVariable;
    stringVariable = _stringVariable;
    boolVariable = _boolVariable;
    addressVariable = _addressVariable;
    bytes32Variable = _bytes32Variable;
  }

  /// @inheritdoc IContractTest
  function setVariables(
    uint256 _newValue,
    string memory _newString,
    bool _newBool,
    address _newAddress,
    bytes32 _newBytes32,
    address[] memory _addressArray,
    uint256[] memory _uint256Array,
    bytes32[] memory _bytes32Array
  ) public returns (bool _result) {
    uintVariable = _newValue;
    stringVariable = _newString;
    boolVariable = _newBool;
    addressVariable = _newAddress;
    bytes32Variable = _newBytes32;
    addressArray = _addressArray;
    uint256Array = _uint256Array;
    bytes32Array = _bytes32Array;
    _result = true;
  }

  function setVariables(uint256 _newValue) public returns (bool _result) {
    uintVariable = _newValue;
    _result = true;
  }
}
