// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./IRC20.sol";
import "./IBridge.sol";
import "./Signature.sol";

contract Bridge is Ownable, Signature, IBridge {
	address admin;

	constructor(address _admin, address _signerAddress) {
		admin = _admin;
		_setSignerAddress(_signerAddress);
	}

	modifier onlyAdmin() {
		require(msg.sender == admin);
		_;
	}

	function deposit(address _token, uint _amount, uint _targetChain) external override payable {
		require(msg.sender!=address(0), "Bridge: Zero sender");
		/* bool _isBridgeToken = false; */
		if (_token==address(0)) {
			require(msg.value==_amount, "Bridge: Amount");
		} else {
			IRC20(_token).transferFrom(msg.sender, address(this), _amount);
		}
		emit Deposit(msg.sender, _token, _amount, _targetChain);
	}

    function transfer(uint _chainId, address _originalToken, address _to, address _token, uint _amount, uint _timestamp, bytes memory _signature) external payable override onlyAdmin {
		require(_verify(_chainId, _originalToken, _to, _amount, _timestamp, _signature), "Bridge: Signature");
		IRC20(_token).transfer(_to, _amount);
		emit Transfer(_chainId, _originalToken, _to, _token, _amount);
	}

    /* function emergencyWithdraw(address _token, uint _timestamp, bytes memory _signature) external payable override onlyOwner {
		require(msg.sender==address(0), "Bridge: Zero sender");
		require(_verifyByOwner(_token, _timestamp, _signature), "Bridge: Signature");
		if (_token==address(0)) {
			uint _balance = payable(address(this)).balance;
			payable(msg.sender).transfer(_balance);
		} else {
			uint _balance = IRC20(_token).balanceOf(address(this));
			IRC20(_token).transfer(msg.sender, _balance);
		}
	} */
}