'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { privacyContract } from '@/lib/blockchain';
import { toast } from 'react-hot-toast';

export default function PrivacyConsent() {
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    const handleConsentChange = async (newConsent: boolean) => {
        try {
            setLoading(true);
            
            // Use API route instead of direct blockchain interaction
            const response = await fetch('/api/privacy/consent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ consent: newConsent }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setConsent(newConsent);
                toast.success('Privacy settings updated successfully');
            } else {
                toast.error('Failed to update privacy settings');
            }
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            toast.error('An error occurred while updating privacy settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="privacy-consent">
            <h3>Privacy Settings</h3>
            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="privacyConsent"
                    checked={consent}
                    onChange={(e) => handleConsentChange(e.target.checked)}
                    disabled={loading}
                />
                <label className="form-check-label" htmlFor="privacyConsent">
                    I consent to the collection and processing of my data using differential privacy
                    and blockchain technology for enhanced security.
                </label>
            </div>
            {loading && <p className="text-sm text-gray-500">Updating privacy settings...</p>}
        </div>
    );
} 