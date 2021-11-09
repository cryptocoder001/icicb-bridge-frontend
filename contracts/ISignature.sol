// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISignature {
    function getMessageHash(uint _chainId, address _originalToken, address _to, uint _amount, uint _timestamp) external pure returns (bytes32);
	function getMessageHash2(address _token, uint _timestamp) external pure returns (bytes32);
}