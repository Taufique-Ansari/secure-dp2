const blockchainService = require('../services/blockchainService');

exports.updatePrivacyConsent = async (req, res) => {
    try {
        const { consent } = req.body;
        const userId = req.user.id;

        // Store consent on blockchain
        const txHash = await blockchainService.setUserConsent(userId, consent);

        res.status(200).json({
            success: true,
            message: 'Privacy consent updated successfully',
            transactionHash: txHash
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating privacy consent',
            error: error.message
        });
    }
}; 