// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./IRC20.sol";
import "./IBridgeCore.sol";
import "./Signature.sol";
import "./Logging.sol";

contract BridgeCore is Ownable, Signature, Logging, IBridgeCore {
	address admin;
	address[] tokenArray;
	mapping(address=>uint) tokens;
	mapping(uint=>mapping(address=>address)) tokensByChain;
	
	constructor(address _admin, address _signerAddress) {
		admin = _admin;
		_setSignerAddress(_signerAddress);
	}

	modifier onlyAdmin() {
		require(msg.sender == admin);
		_;
	}

    function getToken(uint _chainId, address _originalToken) external override view returns (address _token) {
		_token = tokensByChain[_chainId][_originalToken];
	}

    function getTokenByIndex(uint _index) external override view returns (address _token) {
		_token = tokenArray[_index];
	}

    function getTokensLength() external override view returns (uint count) {
		return tokenArray.length;
	}

	function _createToken(uint _chainId, address _originalToken, string memory _name, string memory _symbol, uint8 _decimals) internal returns (address _token) {
		uint count = tokenArray.length;
		IRC20 _tokenContract = new IRC20(_name, _symbol, _decimals);
		_token = address(_tokenContract);
		tokenArray.push(_token);
		tokens[_token] = count;
		tokensByChain[_chainId][_originalToken] = _token;
		emit TokenCreated(_token, _name, _symbol, _decimals);
	}
    
	function deposit(address _token, uint _amount, uint _targetChain, address _targetToken) external override payable {
		require(msg.sender==address(0), "BridgeCore: Zero sender");
		bool _isBridgeToken = false;
		if (_token==address(0)) {
			require(msg.value==_amount, "BridgeCore: Amount");
		} else {
			_isBridgeToken = tokens[_token] != 0;
			if (_isBridgeToken) {
				IRC20(_token).burnFrom(msg.sender, _amount);
			} else {
				IRC20(_token).transferFrom(msg.sender, address(this), _amount);
			}
		}
		_setLog(msg.sender, 0, _token, _targetChain, _targetToken, _amount);
		emit Deposit(msg.sender, _token, _amount, _targetChain, _targetToken, _isBridgeToken);
	}

    function mint(uint _chainId, address _originalToken, string memory _name, string memory _symbol, uint8 _decimals, address _to, uint _amount, uint _timestamp, bytes memory _signature) external override onlyAdmin {
		require(_verify(_chainId, _originalToken, _to, _amount, _timestamp, _signature), "BridgeCore: Signature");
		address _token = tokensByChain[_chainId][_originalToken];
		if (_token==address(0)) _token = _createToken(_chainId, _originalToken, _name, _symbol, _decimals);
		IRC20(_token).mintTo(_to, _amount);
		_setLog(_to, _chainId, _originalToken, 0, _token, _amount);
		emit Mint(_chainId, _originalToken, _to, _token, _amount);
	}

    function transfer(uint _chainId, address _originalToken, address _to, address _token, uint _amount, uint _timestamp, bytes memory _signature) external payable override onlyAdmin {
		require(_verify(_chainId, _originalToken, _to, _amount, _timestamp, _signature), "BridgeCore: Signature");
		IRC20(_token).transfer(_to, _amount);
		_setLog(_to, _chainId, _originalToken, 0, _token, _amount);
		emit Transfer(_chainId, _originalToken, _to, _token, _amount);
	}


	function emergencyWithdraw(address _token, uint _timestamp, bytes memory _signature) external payable override onlyOwner {
		require(msg.sender==address(0), "BridgeCore: Zero sender");
		require(_verifyByOwner(_token, _timestamp, _signature), "BridgeCore: Signature");
		if (_token==address(0)) {
			uint _balance = payable(address(this)).balance;
			payable(msg.sender).transfer(_balance);
		} else {
			uint _balance = IRC20(_token).balanceOf(address(this));
			IRC20(_token).transfer(msg.sender, _balance);
		}
	}
}