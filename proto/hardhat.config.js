require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '.env.local' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  paths: {
    sources: "./src/contracts",
    artifacts: "./src/contracts/artifacts",
  },
  networks: {
    // For local development
    hardhat: {},
    // For testing
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || '49c73fd060f6419ea8ab6ff7c080db02'}`,
      accounts: [`0x${process.env.ETHEREUM_PRIVATE_KEY || 'd838006e8845839adde95576c39a0b709d2b7250083d630970bc16c478b942e0'}`]
    }
  }
}; 