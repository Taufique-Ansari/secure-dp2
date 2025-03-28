const { DifferentialPrivacy } = require('google-differential-privacy');
const blockchainService = require('./blockchainService');

class DifferentialPrivacyService {
    constructor() {
        this.dp = new DifferentialPrivacy();
    }

    async addNoiseToData(data, epsilon, userId) {
        try {
            // Add noise to the data using differential privacy
            const noisyData = this.dp.addLaplaceNoise(data, epsilon);

            // Store privacy parameters on blockchain
            await blockchainService.storePrivacyParameters(
                userId,
                epsilon,
                0.00001, // delta value
                data
            );

            return noisyData;
        } catch (error) {
            console.error('Error in differential privacy processing:', error);
            throw error;
        }
    }

    // Other differential privacy methods...
}

module.exports = new DifferentialPrivacyService(); 