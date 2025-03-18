'use client';

import { useState, useEffect } from 'react';
const { web3, privacyContract, contractAddress } = require('@/lib/blockchain');

export default function BlockchainTest() {
    const [consentStatus, setConsentStatus] = useState<boolean | null>(null);
    const [transactionHash, setTransactionHash] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [account, setAccount] = useState<string>('');

    useEffect(() => {
        // Check if contract is properly configured
        if (!contractAddress) {
            setError('Contract address not configured. Please check environment variables.');
        }
    }, []);

    // Connect to MetaMask
    const connectWallet = async () => {
        if (!contractAddress) {
            setError('Contract address not configured. Please check environment variables.');
            return;
        }
        try {
            if (typeof window.ethereum !== 'undefined') {
                setLoading(true);
                // Request account access
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                setAccount(accounts[0]);
                setError('');
                
                // Switch to Sepolia network if not already on it
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
                    });
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0xaa36a7',
                                chainName: 'Sepolia Test Network',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io']
                            }]
                        });
                    }
                }
            } else {
                setError('Please install MetaMask!');
            }
        } catch (err: any) {
            setError('Error connecting wallet: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Test getting consent status
    const getConsent = async () => {
        if (!contractAddress) {
            setError('Contract address not configured. Please check environment variables.');
            return;
        }
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }
        try {
            setLoading(true);
            const status = await privacyContract.methods
                .hasUserConsent(account)
                .call();
            setConsentStatus(status);
            setError('');
        } catch (err: any) {
            setError('Error getting consent: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Test setting consent
    const setConsent = async (consent: boolean) => {
        if (!contractAddress) {
            setError('Contract address not configured. Please check environment variables.');
            return;
        }
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }
        try {
            setLoading(true);
            const tx = await privacyContract.methods
                .setUserConsent(consent)
                .send({ from: account });
            setTransactionHash(tx.transactionHash);
            setError('');
            // Refresh consent status
            await getConsent();
        } catch (err: any) {
            setError('Error setting consent: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Blockchain Integration Test</h1>
            
            <div className="p-4 border rounded mb-4 bg-gray-50">
                <h2 className="font-semibold mb-2">Debug Info:</h2>
                <p>Contract Address: {contractAddress || 'Not set'}</p>
                <p>Infura Project ID: {process.env.NEXT_PUBLIC_INFURA_PROJECT_ID ? 'Set' : 'Not set'}</p>
            </div>

            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <h2 className="font-semibold mb-2">Wallet Connection:</h2>
                    {account ? (
                        <p>Connected: {account}</p>
                    ) : (
                        <button 
                            onClick={connectWallet}
                            className="px-4 py-2 bg-purple-500 text-white rounded"
                            disabled={loading}
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>

                <div className="p-4 border rounded">
                    <h2 className="font-semibold mb-2">Current Consent Status:</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <p>{consentStatus === null ? 'Not fetched' : consentStatus.toString()}</p>
                    )}
                    <button 
                        onClick={getConsent}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                        disabled={loading}
                    >
                        Check Consent Status
                    </button>
                </div>

                <div className="p-4 border rounded">
                    <h2 className="font-semibold mb-2">Set Consent:</h2>
                    <div className="space-x-2">
                        <button 
                            onClick={() => setConsent(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                            disabled={loading}
                        >
                            Give Consent
                        </button>
                        <button 
                            onClick={() => setConsent(false)}
                            className="px-4 py-2 bg-red-500 text-white rounded"
                            disabled={loading}
                        >
                            Revoke Consent
                        </button>
                    </div>
                </div>

                {transactionHash && (
                    <div className="p-4 border rounded">
                        <h2 className="font-semibold mb-2">Last Transaction Hash:</h2>
                        <p className="break-all">{transactionHash}</p>
                        <a 
                            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            View on Etherscan
                        </a>
                    </div>
                )}

                {error && (
                    <div className="p-4 border border-red-500 rounded bg-red-50">
                        <h2 className="font-semibold mb-2 text-red-700">Error:</h2>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 