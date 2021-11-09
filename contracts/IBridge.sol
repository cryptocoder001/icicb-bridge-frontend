// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBridge {
    event Deposit (address from,   address token, uint amount, uint targetChain);
    event Transfer(uint fromChain, address fromToken, address token, address to, uint amount);

    function deposit(address token, uint amount, uint targetChain) external payable;
    function transfer(uint chainId, address originalToken, address to, address token, uint amount, uint timestamp, bytes memory signature) external payable;

    /* function emergencyWithdraw(address _token, uint _timestamp, bytes memory _signature) external payable; */
}