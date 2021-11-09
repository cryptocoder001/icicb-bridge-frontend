// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./IRC20.sol";
import "./IBridge.sol";
import "./Signature.sol";

interface ILogging {
	struct LOG {
        address account;
        uint chain;
        address token;
        uint targetChain;
        address targetToken;
        uint amount;
        uint created;
    }
	function getLogCount() external view returns(uint);
    function getLog() external view returns(LOG[] memory logs);
    function getLog(uint start, uint _limit) external view returns(LOG[] memory logs);
}