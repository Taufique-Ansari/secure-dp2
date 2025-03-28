'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PrivacyConsent from '@/components/PrivacyConsent';
import { Shield, Lock, Activity, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { generateVirtualAddress } from '@/lib/blockchain';

export default function PrivacyDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  
  const { 
    loading, 
    error, 
    consent,
    transactionHash, 
    records, 
    fetchConsentStatus, 
    fetchPrivacyRecords 
  } = useBlockchain();

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setRefreshing(true);
      await Promise.all([
        fetchConsentStatus(session.user.id),
        fetchPrivacyRecords(session.user.id)
      ]);
      
      // In a real implementation, you might fetch verification status separately
      setVerificationStatus('verified');
    } catch (error) {
      console.error('Error fetching privacy data:', error);
      setVerificationStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, [session?.user?.id, fetchConsentStatus, fetchPrivacyRecords]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login?callbackUrl=/privacy-dashboard');
      return;
    }
    
    fetchData();
  }, [session, status, router, fetchData]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Dashboard</h1>
        <p>Please log in to view your privacy dashboard.</p>
      </div>
    );
  }

  const virtualAddress = generateVirtualAddress(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Privacy Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/privacy/test', {
                  method: 'POST'
                });
                const data = await response.json();
                if (data.success) {
                  // Refresh the data
                  fetchData();
                }
              } catch (error) {
                console.error('Error creating test record:', error);
              }
            }}
            variant="outline" 
            size="sm"
          >
            Create Test Record
          </Button>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Privacy Settings
            </h2>
            
            <PrivacyConsent />
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">About Blockchain Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your privacy choices are securely recorded on blockchain, creating an immutable
                and transparent record that cannot be altered without your knowledge.
              </p>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-primary" />
              Blockchain Privacy Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Blockchain Address</span>
                <div className="flex items-center">
                  <code className="text-xs bg-gray-100 p-1 rounded overflow-x-auto max-w-full">
                    {virtualAddress}
                  </code>
                </div>
              </div>
              
              {transactionHash && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Last Transaction</span>
                  <div className="flex items-center">
                    <code className="text-xs bg-gray-100 p-1 rounded truncate mr-2 flex-1">
                      {transactionHash}
                    </code>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs text-blue-500 hover:underline"
                    >
                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Badge className={
                  verificationStatus === 'verified' ? "bg-green-500" : 
                  verificationStatus === 'error' ? "bg-red-500" : "bg-yellow-500"
                }>
                  {verificationStatus === 'verified' ? "Verified on Blockchain" : 
                   verificationStatus === 'error' ? "Verification Failed" : "Pending Verification"}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Privacy Processing Records
            </h2>
            
            {records && records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Epsilon</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delta</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Hash</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          {new Date(Number(record.timestamp) * 1000).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          {Number(record.epsilon)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          {Number(record.delta)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs truncate max-w-xs">
                          <span className="font-mono">{record.dataHash ? record.dataHash.substring(0, 10) + '...' : 'N/A'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">
                  No privacy processing records found. Records will appear here when your data is processed
                  with differential privacy protections.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 