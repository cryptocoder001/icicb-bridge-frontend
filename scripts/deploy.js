require('colors');
const fs = require('fs');
const networks = require("../src/config/networks.json");
const abiIrc20 = require("../artifacts/contracts/IRC20.sol/IRC20.json");
const abiBridge = require("../artifacts/contracts/Bridge.sol/Bridge.json");
const abiBridgeCore = require("../artifacts/contracts/BridgeCore.sol/BridgeCore.json");
const abiWICICB = require("../artifacts/contracts/WICICB.sol/WICICB.json");

const hre = require("hardhat");


async function main() {
	const admin = "0xC5df89579D7A2f85b8a4b1a6395083da394Bba92";
	const signerAddress = "0x413EBD57EbA0f200ed592c31E7dB6119C92A7973";
	const signer = await hre.ethers.getSigner();
	const network = await signer.provider._networkPromise;
	const rpc = 'http://192.168.115.160:5050'; // signer.provider.connection.url;
	const explorer = 'http://192.168.115.160:5050'; // signer.provider.connection.url;
	const chainId = network.chainId;
	const decimals = 18
	const erc20 = "IRC20"
	console.log('Starting ICICB' + ('(' + String(chainId).red + ')') + ' by ', signer.address.yellow);

	console.log('Deploying WICICB contract...'.blue);
	const WICICB = await hre.ethers.getContractFactory("WICICB");
	const wIcicb = await WICICB.deploy();
	const wicicb = wIcicb.address;
	console.log('\tWICICB :', 	wicicb.green);

	console.log('Deploying BridgeCore contract...'.blue);
	const BridgeCore = await hre.ethers.getContractFactory("BridgeCore");
	const bridgeCore = await BridgeCore.deploy(admin, signerAddress);
	const bridge = bridgeCore.address;
	console.log('\tBridgeCore :', bridge.green);

	console.log('writing abis and addresses...'.blue);
	/* -------------- writing... -----------------*/
	fs.writeFileSync(`./src/config/abis/IRC20.json`,  	 JSON.stringify(abiIrc20.abi, null, 4));
	fs.writeFileSync(`./src/config/abis/WICICB.json`,	 JSON.stringify(abiWICICB.abi, null, 4));
	fs.writeFileSync(`./src/config/abis/BridgeCore.json`,JSON.stringify(abiBridgeCore.abi, null, 4));
	fs.writeFileSync(`./src/config/abis/Bridge.json`,  	 JSON.stringify(abiBridge.abi, null, 4));
	fs.writeFileSync(`./src/config/networks.json`,   	 JSON.stringify({...networks, ICICB: {bridge, wicicb, chainId, decimals, rpc, explorer, erc20}}, null, 4));
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
