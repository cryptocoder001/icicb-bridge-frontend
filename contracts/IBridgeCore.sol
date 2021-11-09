// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBridgeCore {
    
    event TokenCreated  (address token,  string name,       string symbol, uint8 decimals);
    event Mint          (uint fromChain, address fromToken, address token, address to, uint amount);
    event Transfer      (uint fromChain, address fromToken, address token, address to, uint amount);
    event Deposit       (address from,   address token, uint amount, uint targetChain, address targetToken, bool isBridgeToken);

    function getToken(uint _chainId, address _originalToken) external view returns (address token);
    function getTokenByIndex(uint index) external view returns (address token);
    function getTokensLength() external view returns (uint count);
    
    function mint(uint chainId, address originalToken, string memory name, string memory symbol, uint8 decimals, address to, uint amount, uint timestamp, bytes memory signature) external;
    function deposit(address token, uint amount, uint targetChain, address targetToken) external payable;
    function transfer(uint chainId, address originalToken, address to, address token, uint amount, uint timestamp, bytes memory signature) external payable;

    function emergencyWithdraw(address token, uint timestamp, bytes memory signature) external payable;
}