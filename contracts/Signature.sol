// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ISignature.sol";

contract Signature is ISignature {
    address signerAddress;

    function _setSignerAddress(address _signerAddress) internal {
        signerAddress = _signerAddress;
    }

    function getMessageHash(uint _chainId, address _originalToken, address _to, uint _amount, uint _timestamp) public override pure returns (bytes32) {
        return keccak256(abi.encodePacked(_chainId, _originalToken, _to, _amount, _timestamp));
    }

	function _verify(uint _chainId, address _originalToken, address _to, uint _amount, uint _timestamp, bytes memory _signature) internal view returns (bool) {
        bytes32 _messageHash = getMessageHash(_chainId, _originalToken, _to, _amount, _timestamp);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        return recoverSigner(_ethSignedMessageHash, _signature) == signerAddress;
    }
	function getMessageHash2(address _token, uint _timestamp) public override pure returns (bytes32) {
        return keccak256(abi.encodePacked(_token, _timestamp));
    }

	function _verifyByOwner(address _token, uint _timestamp, bytes memory _signature) internal view returns (bool) {
        bytes32 _messageHash = getMessageHash2(_token, _timestamp);
        bytes32 _ethSignedMessageHash = getEthSignedMessageHash(_messageHash);
        return recoverSigner(_ethSignedMessageHash, _signature) == signerAddress;
    }

    function getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "BridgeCore: Signature length");
		
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}