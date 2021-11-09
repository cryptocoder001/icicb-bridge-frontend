require('colors');
const fs = require('fs');
const networks = require("../src/config/networks.json");
/* const abiBridge = require("../artifacts/contracts/Bridge.sol/Bridge.json"); */

const hre = require("hardhat");

async function main() {
	const netId = "ETH"
	const decimals = 18
	const admin = "0xC5df89579D7A2f85b8a4b1a6395083da394Bba92";
	const signerAddress = "0x413EBD57EbA0f200ed592c31E7dB6119C92A7973";

	const signer = await hre.ethers.getSigner();
	const network = await signer.provider._networkPromise;
	const rpc = 'http://192.168.115.160:7545'; // signer.provider.connection.url;
	const explorer = 'http://192.168.115.160:7545'; // signer.provider.connection.url;
	const chainId = network.chainId;
	const erc20 = 'ERC20';
	console.log('Starting ' + netId + ('(' + String(chainId).red + ')') + ' by ', signer.address.yellow);

	console.log('Deploying Bridge contract...'.blue);
	const Bridge = await hre.ethers.getContractFactory("Bridge");
	const bridge = await Bridge.deploy(admin, signerAddress);
	console.log('\tBridge :', bridge.address.green);

	console.log('writing abis and addresses...'.blue);
	/* -------------- writing... -----------------*/
	fs.writeFileSync(`./src/config/networks.json`,   JSON.stringify({...networks, [netId]:{bridge:bridge.address, chainId, decimals, rpc, explorer, erc20}}, null, 4));
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
