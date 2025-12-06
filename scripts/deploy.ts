import { ethers } from "hardhat";

async function main() {
    const USDC_ADDRESS_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Mock USDC on Sepolia or real one
    // Check strict address for Base Sepolia USDC or use a mock for dev

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Game = await ethers.getContractFactory("BasketPartyPayment");
    // Deploy with USDC address and Treasury (deployer as treasury for now)
    const game = await Game.deploy(USDC_ADDRESS_BASE_SEPOLIA, deployer.address);

    await game.waitForDeployment();

    console.log(`BasketPartyPayment deployed to ${game.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
