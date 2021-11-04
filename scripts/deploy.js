require('colors');
const fs = require('fs');
const contracts = require("../src/config/contracts.json");
const abiDeploy = require("../artifacts/contracts/Deploy.sol/Deploy.json");

const {ethers} = require("ethers");
const hre = require("hardhat");


async function main() {
	const signer = await hre.ethers.getSigner();
	const network = await signer.provider._networkPromise;
	const chainId = network.chainId;
	console.log('Starting by '.blue, signer.address.yellow);
	const deploy = await hre.ethers.getContractFactory("Deploy");
	const deployContract = await deploy.deploy();
	console.log('Deploying DM contract...'.blue);
	const dm = new ethers.Contract(deployContract.address, abiDeploy.abi, signer);
	
	let tx = await dm.deply();
	await tx.wait()
	const contractAddress = await dm.getTokens();
	
	console.log('writing abis and addresses...'.blue);
	/* -------------- writing... -----------------*/
	fs.writeFileSync(`./src/config/abi/router.json`,  JSON.stringify(abiRouter.abi, null, 4));
	fs.writeFileSync(`./src/config/contracts.json`,   JSON.stringify({...contracts, [chainId]:result}, null, 4));
	console.log('complete'.green);
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
