import { ethers } from "hardhat";

async function main() {
    const USDC_ADDRESS_BASE_SEPOLIA = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base Mainnet
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
