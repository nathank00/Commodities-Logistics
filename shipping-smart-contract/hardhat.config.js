/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-ethers");
require("dotenv").config(); // Load environment variables

module.exports = {
    solidity: "0.8.28",
    networks: {
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [`0x${process.env.PRIVATE_KEY}`]
        }
    }
};
