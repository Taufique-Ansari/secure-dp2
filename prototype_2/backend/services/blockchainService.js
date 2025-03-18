const { web3, privacyContract } = require('../blockchain/BlockchainConfig');
const crypto = require('crypto');

class BlockchainService {
    async storePrivacyParameters(userId, epsilon, delta, data) {
        try {
            const dataHash = this.generateDataHash(data);
            const account = web3.eth.accounts.privateKeyToAccount(process.env.ETHEREUM_PRIVATE_KEY);
            
            const tx = await privacyContract.methods
                .setPrivacyParameters(epsilon, delta, dataHash)
                .send({ from: account.address });
                
            return tx.transactionHash;
        } catch (error) {
            console.error('Blockchain storage error:', error);
            throw error;
        }
    }

    async getUserConsent(userAddress) {
        try {
            return await privacyContract.methods.hasUserConsent(userAddress).call();
        } catch (error) {
            console.error('Error getting user consent:', error);
            throw error;
        }
    }

    async setUserConsent(userAddress, consent) {
        try {
            const account = web3.eth.accounts.privateKeyToAccount(process.env.ETHEREUM_PRIVATE_KEY);
            
            const tx = await privacyContract.methods
                .setUserConsent(consent)
                .send({ from: account.address });
                
            return tx.transactionHash;
        } catch (error) {
            console.error('Error setting user consent:', error);
            throw error;
        }
    }

    generateDataHash(data) {
        return '0x' + crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }
}

module.exports = new BlockchainService(); 