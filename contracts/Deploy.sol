//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import './ERC20.sol';


contract Deploy {
    address target;

    function deply() public {

    }
    
    function getTokens() public view returns(address) {
        return target;
    }
}