require('colors');
const fs = require('fs');
const networks = require("../src/config/networks.json");
/* const abiBridge = require("../artifacts/contracts/Bridge.sol/Bridge.json"); */

const hre = require("hardhat");

async function main() {
	const signer = await hre.ethers.getSigner();
	const DeployTokens = await hre.ethers.getContractFactory("DeployTokens");
	const tokens = ['USDT','USDC','LINK'];
	const deployTokens = await DeployTokens.deploy(tokens, signer.address);
	const addrs = await deployTokens.getTokens();
	for(let i=0; i<addrs.length; i++) {
		console.log(tokens[i].blue, addrs[i].green);
	}
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
