// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ILogging.sol";

contract Logging is ILogging {
	LOG[] logs;

	function _setLog(address _account, uint _chain, address _token, uint _targetChain, address _targetToken, uint _amount) internal {
		logs.push(LOG(_account, _chain, _token, _targetChain, _targetToken, _amount, block.timestamp));
	}

	function getLogCount() public override view returns(uint) {
		return logs.length;
	}

	function getLog() public override view returns(LOG[] memory _logs) {
		uint count = logs.length;
		uint _start = 0;
		uint _limit = 0;
		if (count==0) {
			_start = 0;
			_limit = 0;
		} else {
			if (count > 10) {
				_start = count - 10;
				_limit = 10;
			} else {
				_start = 0;
				_limit = count;
			}
		}
		_logs = new LOG[](_limit);
		for(uint i=0; i<_limit; i++) {
			_logs[i] = logs[i + _start];
		}
	}
	function getLog(uint _start, uint _limit) public override view returns(LOG[] memory _logs) {
		uint count = logs.length;
		if (count==0) {
			_start = 0;
			_limit = 0;
		} else {
			if (_start > count-1) _start > count-1;
			if (_limit > 20) _limit = 20;
			if (_start + _limit > count) _limit = count - _start;
		}
		_logs = new LOG[](_limit);
		for(uint i=0; i<_limit; i++) {
			_logs[i] = logs[i + _start];
		}
	}
}