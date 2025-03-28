const Web3 = require('web3');
const PrivacyContract = require('./contracts/PrivacyContract.json');

// Configure Web3 with your Ethereum node (e.g., Infura for production)
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_NODE_URL));

// Contract address after deployment
const contractAddress = process.env.PRIVACY_CONTRACT_ADDRESS;

// Initialize contract instance
const privacyContract = new web3.eth.Contract(
    PrivacyContract.abi,
    contractAddress
);

module.exports = {
    web3,
    privacyContract
}; 