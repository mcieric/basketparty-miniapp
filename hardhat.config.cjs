require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        "base-sepolia": {
            url: "https://sepolia.base.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: 1000000000,
        },
    },
    etherscan: {
        apiKey: {
            "base-sepolia": process.env.BASESCAN_API_KEY || "PLACEHOLDER_KEY",
        },
        customChains: [
            {
                network: "base-sepolia",
                chainId: 84532,
                urls: {
                    apiURL: "https://api-sepolia.basescan.org/api",
                    browserURL: "https://sepolia.basescan.org"
                }
            }
        ]
    },
};
