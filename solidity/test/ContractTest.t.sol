// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from 'forge-std/Test.sol';
import {IERC20} from 'isolmate/interfaces/tokens/IERC20.sol';
import {MockContractTest} from 'test/mock-contracts/contracts/MockContractTest.sol';
import {console} from 'forge-std/console.sol';

contract CommonE2EBase is Test {
  uint256 internal constant _FORK_BLOCK = 15_452_788;

  address internal _user = makeAddr('user');
  address internal _owner = makeAddr('owner');
  MockContractTest internal _contractTest;

  function setUp() public {
    vm.createSelectFork(vm.rpcUrl('mainnet'), _FORK_BLOCK);
    vm.prank(_owner);
    _contractTest = new MockContractTest(
            1,
            "2",
            true,
            _owner,
            bytes32("4")
        );
    vm.allowCheatcodes(address(_contractTest));
  }
}

contract E2EMockContractTest_Set_Simple_Vars is CommonE2EBase {
  function test_Set_UintVar() public {
    _contractTest.set_uintVariable(1);
    assertEq(_contractTest.uintVariable(), 1);
  }

  function test_Set_StringVar() public {
    _contractTest.set_stringVariable('2');
    assertEq(_contractTest.stringVariable(), '2');
  }

  function test_Set_BoolVar() public {
    _contractTest.set_boolVariable(true);
    assertEq(_contractTest.boolVariable(), true);
  }

  function test_Set_AddressVar() public {
    _contractTest.set_addressVariable(_user);
    assertEq(_contractTest.addressVariable(), _user);
  }

  function test_Set_Bytes32Var() public {
    _contractTest.set_bytes32Variable(bytes32('4'));
    assertEq(_contractTest.bytes32Variable(), bytes32('4'));
  }

  // internal
  function test_Set_InternalUintVar() public {
    _contractTest.set_internalUint256(1);
    assertEq(_contractTest.getInternalUint256(), 1);
  }
}

contract E2EMockContractTest_Set_Array_Vars is CommonE2EBase {
  function test_Set_AddressArray() public {
    address[] memory _addressArray = new address[](2);
    _addressArray[0] = _user;
    _addressArray[1] = _owner;

    _contractTest.set_addressArray(_addressArray);

    assertEq(_contractTest.addressArray(0), _user);
    assertEq(_contractTest.addressArray(1), _owner);
  }

  function test_Set_UintArray() public {
    uint256[] memory _uintArray = new uint256[](2);
    _uintArray[0] = 1;
    _uintArray[1] = 2;

    _contractTest.set_uint256Array(_uintArray);
    assertEq(_contractTest.uint256Array(0), 1);
    assertEq(_contractTest.uint256Array(1), 2);
  }

  function test_Set_BytesArray() public {
    bytes32[] memory _bytes32Array = new bytes32[](2);
    _bytes32Array[0] = bytes32('4');
    _bytes32Array[1] = bytes32('5');
    _contractTest.set_bytes32Array(_bytes32Array);
    assertEq(_contractTest.bytes32Array(0), bytes32('4'));
    assertEq(_contractTest.bytes32Array(1), bytes32('5'));
  }

  // internal
  function test_Set_InternalAddressArray() public {
    address[] memory _addressArray = new address[](2);
    _addressArray[0] = _user;
    _addressArray[1] = _owner;
    _contractTest.set_internalAddressArray(_addressArray);
    assertEq(_contractTest.getInternalAddressArray(), _addressArray);
  }
}

contract E2EMockContractTest_Set_Mapping_Vars is CommonE2EBase {
  function test_Set_Uint256ToAddressMappings() public {
    _contractTest.set_uint256ToAddress(1, _owner);
    assertEq(_contractTest.uint256ToAddress(1), _owner);
  }

  function test_Set_AddressToUintMappings() public {
    _contractTest.set_addressToUint(_user, 1);
    assertEq(_contractTest.addressToUint(_user), 1);
  }

  function test_Set_Bytes32ToBytesMappings() public {
    _contractTest.set_bytes32ToBytes(bytes32('4'), bytes('5'));
    assertEq(_contractTest.bytes32ToBytes(bytes32('4')), bytes('5'));
  }

  // isn't implemented
  // _contractTest.set_uint256ToAddressToBytes32(1, _owner, bytes32('4'));
  // assertEq(_contractTest.uint256ToAddressToBytes32(1, _owner), bytes32('4'));

  // internal
  function test_SetInternalUint256ToAddressMappings() public {
    _contractTest.set_internalUint256ToAddress(1, _owner);
    assertEq(_contractTest.getInternalUint256ToAddress(1), _owner);
  }
}

contract E2EMockContractTest_Mock_call_Simple_Vars is CommonE2EBase {
  function test_MockCall_UintVar() public {
    _contractTest.mock_call_uintVariable(10);
    assertEq(_contractTest.uintVariable(), 10);
  }

  function test_MockCall_StringVar() public {
    _contractTest.mock_call_stringVariable('20');
    assertEq(_contractTest.stringVariable(), '20');
  }

  function test_MockCall_BoolVar() public {
    _contractTest.mock_call_boolVariable(true);
    assertEq(_contractTest.boolVariable(), true);
  }

  function test_MockCall_AddressVar() public {
    _contractTest.mock_call_addressVariable(_user);
    assertEq(_contractTest.addressVariable(), _user);
  }

  function test_MockCall_Bytes32Var() public {
    _contractTest.mock_call_bytes32Variable(bytes32('40'));
    assertEq(_contractTest.bytes32Variable(), bytes32('40'));
  }

  function test_MockCall_InternalUintVar_Fail() public {
    // no mock calls for internal vars
    (bool _success,) =
      address(_contractTest).call(abi.encodeWithSignature('mock_call_internalUintVariable(uint256)', 10));
    assertEq(_success, false);
  }
}

contract E2EMockContractTest_Mock_call_Array_Vars is CommonE2EBase {
  function test_MockCall_AddressArray() public {
    _contractTest.mock_call_addressArray(0, _user);
    assertEq(_contractTest.addressArray(0), _user);
  }

  function test_MockCall_UintArray() public {
    _contractTest.mock_call_uint256Array(0, 10);
    assertEq(_contractTest.uint256Array(0), 10);
  }

  function test_MockCall_BytesArray() public {
    _contractTest.mock_call_bytes32Array(0, bytes32('40'));
    assertEq(_contractTest.bytes32Array(0), bytes32('40'));
  }

  function test_MockCall_InternalAddressArray_Fail() public {
    // no mock calls for internal vars
    (bool _success,) =
      address(_contractTest).call(abi.encodeWithSignature('mock_call_internalAddressArray(uint256,address)', 0, _user));
    assertEq(_success, false);
  }
}

contract E2EMockContractTest_Mock_call_Mapping_Vars is CommonE2EBase {
  function test_MockCall_Uint256ToAddressMappings() public {
    _contractTest.mock_call_uint256ToAddress(10, _owner);
    assertEq(_contractTest.uint256ToAddress(10), _owner);
  }

  function test_MockCall_AddressToUintMappings() public {
    _contractTest.mock_call_addressToUint(_user, 10);
    assertEq(_contractTest.addressToUint(_user), 10);
  }

  function test_MockCall_Bytes32ToBytesMappings() public {
    _contractTest.mock_call_bytes32ToBytes(bytes32('40'), bytes('50'));
    assertEq(_contractTest.bytes32ToBytes(bytes32('40')), bytes('50'));
  }

  // isn't implemented
  // _contractTest.mock_call_uint256ToAddressToBytes32(10, _owner, bytes32('40'));
  // assertEq(_contractTest.uint256ToAddressToBytes32(10, _owner), bytes32('40'));

  function test_MockCall_InternalUint256ToAddressMappings_Fail() public {
    // no mock calls for internal vars
    (bool _success,) = address(_contractTest).call(
      abi.encodeWithSignature('mock_call_internalUint256ToAddress(uint256,address)', 10, _owner)
    );
    assertEq(_success, false);
  }
}

contract E2EMockContractTest_Mock_call_External_Func is CommonE2EBase {
  function test_MockCall_SetVariables1() public {
    _contractTest.mock_call_setVariables(10, false);
    assertEq(_contractTest.setVariables(10), false);
    assertEq(_contractTest.setVariables(11), true);
  }

  function test_MockCall_SetVariables2() public {
    _contractTest.mock_call_setVariables(20, false, false);
    assertEq(_contractTest.setVariables(20, false), false);
    assertEq(_contractTest.setVariables(20, true), true);
  }

  function test_MockCall_TestFunc() public {
    _contractTest.mock_call_testFunc(2, false);
    assertEq(_contractTest.testFunc(2), false);
    assertEq(_contractTest.testFunc(3), true);
  }
}

contract E2EMockContractTest_Mock_call_Internal_Func is CommonE2EBase {
  function test_MockCallI_internalVirtualFunction() public {
    _contractTest.mock_call_internalVirtualFunction(10, false, 12, 'TEST');
    (bool _res1, uint256 _res2, string memory _res3) = _contractTest.callInternalVirtualFunction(10);
    assertEq(_res1, false);
    assertEq(_res2, 12);
    assertEq(_res3, 'TEST');

    (_res1, _res2, _res3) = _contractTest.callInternalVirtualFunction(11);
    assertEq(_res1, true);
    assertEq(_res2, 1);
    assertEq(_res3, 'test');
  }
}
