'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateVirtualAddress } from '@/lib/blockchain';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useIsomorphicLayoutEffect } from '@/hooks/useClient';

// Dynamic import web3 and contract to avoid SSR issues
let web3: any;
let privacyContract: any;
if (typeof window !== 'undefined') {
  import('@/lib/blockchain').then((module) => {
    web3 = module.web3;
    privacyContract = module.privacyContract;
  });
}

interface PrivacyRecord {
  epsilon: number | string;
  delta: number | string;
  timestamp: number | string;
  dataHash: string;
}

export function useBlockchain() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [records, setRecords] = useState<PrivacyRecord[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [web3Available, setWeb3Available] = useState<boolean>(false);

  // Check if web3 is available (MetaMask installed)
  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return;
    
    const checkWeb3 = async () => {
      if ((window as any).ethereum) {
        setWeb3Available(true);
        
        // Listen for account changes
        (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
          console.log('MetaMask accounts changed:', accounts);
          if (session?.user?.id) {
            fetchConsentStatus(session.user.id);
          }
        });
      } else {
        setWeb3Available(false);
      }
    };
    
    checkWeb3();
    
    return () => {
      // Clean up listeners
      if ((window as any).ethereum) {
        (window as any).ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch consent status from blockchain
  const fetchConsentStatus = useCallback(async (userId: string) => {
    if (!userId || typeof window === 'undefined') return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching consent status for user:', userId);
      const userAddress = generateVirtualAddress(userId);
      console.log('Generated address:', userAddress);
      
      // First try blockchain API
      try {
        const response = await fetch('/api/privacy/status');
        const data = await response.json();
        
        console.log('API response:', data);
        
        if (data.success) {
          setConsent(data.consent);
          setVerificationStatus(data.verificationStatus);
          if (data.transactionHash) {
            setTransactionHash(data.transactionHash);
          }
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Continue with direct blockchain call if API fails
      }
      
      // Direct blockchain call as fallback
      // Make sure web3 is loaded
      if (!web3 || !privacyContract) {
        setError('Web3 not initialized');
        setLoading(false);
        return;
      }
      
      try {
        // Get accounts from MetaMask
        const accounts = await web3.eth.getAccounts();
        
        if (accounts && accounts.length > 0) {
          console.log('Using account:', accounts[0]);
          // Check if the user has given consent
          const hasConsent = await privacyContract.methods
            .hasUserConsent(userAddress)
            .call({ from: accounts[0] });
            
          console.log('Consent status from blockchain:', hasConsent);
          setConsent(hasConsent);
          setVerificationStatus('verified');
        } else {
          console.log('No accounts found, using read-only mode');
          // Fall back to read-only mode
          const hasConsent = await privacyContract.methods
            .hasUserConsent(userAddress)
            .call();
            
          console.log('Consent status from blockchain (read-only):', hasConsent);
          setConsent(hasConsent);
          setVerificationStatus('verified');
        }
      } catch (blockchainError) {
        console.error('Blockchain error:', blockchainError);
        setError('Failed to fetch consent status from blockchain');
        setVerificationStatus('error');
        // Keep the current consent state unchanged
      }
    } catch (error) {
      console.error('Error in fetchConsentStatus:', error);
      setError('Failed to fetch consent status');
      setVerificationStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set user consent on blockchain
  const setBlockchainConsent = useCallback(async (newConsent: boolean) => {
    if (typeof window === 'undefined') return false;
    
    console.log('Setting consent to:', newConsent);
    setLoading(true);
    setError(null);
    
    try {
      // If MetaMask is available, try to use it
      if (web3Available && web3 && privacyContract) {
        try {
          // Request account access if needed
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          
          const accounts = await web3.eth.getAccounts();
          console.log('Available accounts:', accounts);
          
          if (accounts && accounts.length > 0) {
            console.log('Using MetaMask account:', accounts[0]);
            
            try {
              // Direct MetaMask transaction
              const result = await privacyContract.methods
                .setUserConsent(newConsent)
                .send({ 
                  from: accounts[0],
                  gas: 200000 
                });
                
              console.log('Transaction result:', result);
              setTransactionHash(result.transactionHash);
              setVerificationStatus('verified');
              setConsent(newConsent);
              
              toast.success("Privacy consent updated and verified on blockchain.");
              
              return true;
            } catch (txError) {
              console.error('Transaction error:', txError);
              // If there's an error with the transaction, fall back to the API
              throw new Error('Failed to submit transaction: ' + (txError instanceof Error ? txError.message : String(txError)));
            }
          }
        } catch (metaMaskError) {
          console.error('MetaMask error:', metaMaskError);
          toast.error("Could not connect to MetaMask. Using server-side method instead.");
          // Continue to API method
        }
      }
      
      // If we get here, we need to use the API to update consent
      console.log('Using API to update consent');
      const response = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: newConsent }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (data.success) {
        setConsent(newConsent);
        setVerificationStatus('pending');
        toast.success("Privacy consent updated in database.");
        return true;
      } else {
        throw new Error(data.message || 'Failed to update consent');
      }
    } catch (error) {
      console.error('Error setting consent:', error);
      setError('Failed to set consent');
      toast.error(error instanceof Error ? error.message : "Failed to update your privacy consent.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [web3Available]);

  // Fetch privacy records from blockchain
  const fetchPrivacyRecords = useCallback(async (userId: string) => {
    if (!userId || typeof window === 'undefined') return;
    if (!web3 || !privacyContract) {
      setRecords([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching privacy records for user:', userId);
      const userAddress = generateVirtualAddress(userId);
      
      // Get accounts from MetaMask or use read-only mode
      let recordsData;
      
      if (web3Available) {
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts && accounts.length > 0) {
            // Use user's MetaMask account
            console.log('Using MetaMask account for records fetch:', accounts[0]);
            recordsData = await privacyContract.methods
              .getUserPrivacyParamsByAdmin(userAddress)
              .call({ from: accounts[0] });
          }
        } catch (metaMaskError) {
          console.error('MetaMask error when fetching records:', metaMaskError);
          // Fall back to read-only mode
        }
      }
      
      // Fall back to read-only mode if needed
      if (!recordsData) {
        console.log('Using read-only mode for records fetch');
        recordsData = await privacyContract.methods
          .getUserPrivacyParamsByAdmin(userAddress)
          .call();
      }
      
      console.log('Records from blockchain:', recordsData);
      
      if (Array.isArray(recordsData)) {
        setRecords(recordsData);
      } else {
        console.error('Invalid records data:', recordsData);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching privacy records:', error);
      setError('Failed to fetch privacy records from blockchain');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [web3Available]);

  // Auto-fetch data when session changes
  useEffect(() => {
    if (session?.user?.id && typeof window !== 'undefined') {
      fetchConsentStatus(session.user.id);
      fetchPrivacyRecords(session.user.id);
    }
  }, [session, fetchConsentStatus, fetchPrivacyRecords]);

  return {
    loading,
    error,
    consent,
    transactionHash,
    records,
    verificationStatus,
    fetchConsentStatus,
    setConsent: setBlockchainConsent,
    fetchPrivacyRecords,
    setTransactionHash,
    setVerificationStatus,
    web3Available
  };
} 