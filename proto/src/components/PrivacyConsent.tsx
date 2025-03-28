'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useBlockchain } from '@/hooks/useBlockchain';
import toast from 'react-hot-toast';
import { Shield, Loader2 } from 'lucide-react';

export default function PrivacyConsent() {
  const { data: session } = useSession();
  const [consent, setConsent] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { 
    loading, 
    error, 
    transactionHash, 
    fetchConsentStatus, 
    setConsent: setBlockchainConsent,
    setTransactionHash,
    setVerificationStatus
  } = useBlockchain();

  useEffect(() => {
    if (session?.user?.id) {
      fetchConsentStatus(session.user.id);
    }
  }, [session?.user?.id, fetchConsentStatus]);

  const handleConsentChange = async (newConsent: boolean) => {
    try {
      console.log('Changing consent to:', newConsent);
      setUpdating(true);
      
      const response = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent: newConsent }),
      });
      
      const data = await response.json();
      console.log('Consent update response:', data);
      
      if (data.success) {
        setConsent(newConsent);
        if (data.transactionHash) {
          setTransactionHash(data.transactionHash);
          setVerificationStatus('verified');
          toast.success('Your consent has been recorded on the blockchain.');
        } else {
          setVerificationStatus('pending');
          toast.success('Your consent has been saved but blockchain verification is pending.');
        }
      } else {
        toast.error(data.message || 'There was an error updating your consent.');
        console.error('Failed to update consent:', data);
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('There was an error updating your privacy settings.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading privacy settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <Checkbox
          id="privacy-consent"
          checked={consent}
          onCheckedChange={handleConsentChange}
          disabled={updating}
        />
        <div className="space-y-1">
          <label
            htmlFor="privacy-consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I consent to data collection and processing with differential privacy
          </label>
          <p className="text-sm text-gray-500">
            Your data will be processed with privacy-preserving techniques to ensure your information remains protected.
          </p>
        </div>
      </div>

      {transactionHash && (
        <div className="text-xs text-gray-500">
          Transaction: {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
        </div>
      )}

      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>
          {consent 
            ? 'Your privacy preferences are securely recorded on blockchain'
            : 'Your privacy preferences are not currently recorded on blockchain'}
        </span>
      </div>
    </div>
  );
} 