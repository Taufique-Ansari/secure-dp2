'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Database, RefreshCw, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PrivacySettingsPage() {
  const { data: session, status } = useSession();
  const isAdmin = useAdmin();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Differential Privacy Settings
  const [epsilonValue, setEpsilonValue] = useState('0.5');
  const [noiseDistribution, setNoiseDistribution] = useState('laplace');
  const [sensitivityValue, setSensitivityValue] = useState('1.0');
  const [privacyBudget, setPrivacyBudget] = useState('10.0');
  
  // Blockchain Settings
  const [blockchainEnabled, setBlockchainEnabled] = useState(true);
  const [networkType, setNetworkType] = useState('testnet');
  const [gasLimit, setGasLimit] = useState('3000000');
  const [confirmations, setConfirmations] = useState('2');
  
  // Data Retention Settings
  const [userDataRetention, setUserDataRetention] = useState('365');
  const [anonymizationEnabled, setAnonymizationEnabled] = useState(true);
  const [logRetention, setLogRetention] = useState('90');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session?.user?.isAdmin !== true) {
      router.push('/');
      return;
    }

    // In a real application, you would fetch settings from an API
    // For now, we'll simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [session, status, isAdmin, router]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // In a real application, you would call an API to save the settings
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success('Privacy settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    // Differential Privacy defaults
    setEpsilonValue('0.5');
    setNoiseDistribution('laplace');
    setSensitivityValue('1.0');
    setPrivacyBudget('10.0');
    
    // Blockchain defaults
    setBlockchainEnabled(true);
    setNetworkType('testnet');
    setGasLimit('3000000');
    setConfirmations('2');
    
    // Data Retention defaults
    setUserDataRetention('365');
    setAnonymizationEnabled(true);
    setLogRetention('90');
    
    toast.success('Settings reset to defaults');
  };

  if (status === 'loading' || loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (session?.user?.isAdmin !== true) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
      <p>You need admin privileges to view this page.</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Differential Privacy</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Configure how differential privacy is applied to protect user data while maintaining useful analytics.
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="epsilonValue">Epsilon Value</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="epsilonValue"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={epsilonValue}
                  onChange={(e) => setEpsilonValue(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lower values provide stronger privacy but less accuracy (recommended: 0.1-1.0)
              </p>
            </div>
            
            <div>
              <Label htmlFor="noiseDistribution">Noise Distribution</Label>
              <select
                id="noiseDistribution"
                value={noiseDistribution}
                onChange={(e) => setNoiseDistribution(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="laplace">Laplace</option>
                <option value="gaussian">Gaussian</option>
                <option value="exponential">Exponential</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="sensitivityValue">Sensitivity</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="sensitivityValue"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={sensitivityValue}
                  onChange={(e) => setSensitivityValue(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="privacyBudget">Privacy Budget</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="privacyBudget"
                  type="number"
                  step="0.5"
                  min="1"
                  value={privacyBudget}
                  onChange={(e) => setPrivacyBudget(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Blockchain Settings</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Configure blockchain integration for secure and transparent transaction records.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="blockchainEnabled"
                checked={blockchainEnabled}
                onChange={(e) => setBlockchainEnabled(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="blockchainEnabled" className="ml-2">Enable Blockchain Integration</Label>
            </div>
            
            <div>
              <Label htmlFor="networkType">Network Type</Label>
              <select
                id="networkType"
                value={networkType}
                onChange={(e) => setNetworkType(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!blockchainEnabled}
              >
                <option value="mainnet">Mainnet (Production)</option>
                <option value="testnet">Testnet (Testing)</option>
                <option value="local">Local (Development)</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="gasLimit">Gas Limit</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="gasLimit"
                  type="number"
                  min="1000000"
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                  disabled={!blockchainEnabled}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirmations">Required Confirmations</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="confirmations"
                  type="number"
                  min="1"
                  max="12"
                  value={confirmations}
                  onChange={(e) => setConfirmations(e.target.value)}
                  disabled={!blockchainEnabled}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Data Retention</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Configure how long user data is stored and when it should be anonymized or deleted.
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="userDataRetention">User Data Retention (days)</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="userDataRetention"
                  type="number"
                  min="30"
                  value={userDataRetention}
                  onChange={(e) => setUserDataRetention(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How long to keep personally identifiable information
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymizationEnabled"
                checked={anonymizationEnabled}
                onChange={(e) => setAnonymizationEnabled(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="anonymizationEnabled" className="ml-2">Anonymize Instead of Delete</Label>
            </div>
            
            <div>
              <Label htmlFor="logRetention">Log Retention (days)</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="logRetention"
                  type="number"
                  min="7"
                  value={logRetention}
                  onChange={(e) => setLogRetention(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How long to keep system logs and activity records
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Privacy Impact Assessment</h2>
        <p className="text-gray-600 mb-4">
          Based on your current settings, here's an assessment of your privacy protection:
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Differential Privacy Strength</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${
                  parseFloat(epsilonValue) <= 0.3 ? 'bg-green-600' : 
                  parseFloat(epsilonValue) <= 0.7 ? 'bg-yellow-400' : 
                  'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (1 - parseFloat(epsilonValue) / 2) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Blockchain Security</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${
                  !blockchainEnabled ? 'bg-red-500' :
                  networkType === 'mainnet' ? 'bg-green-600' : 
                  networkType === 'testnet' ? 'bg-yellow-400' : 
                  'bg-red-500'
                }`}
                style={{ width: `${
                  !blockchainEnabled ? 10 :
                  networkType === 'mainnet' ? 100 : 
                  networkType === 'testnet' ? 70 : 
                  40
                }%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Data Protection</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${
                  parseInt(userDataRetention) <= 90 ? 'bg-green-600' : 
                  parseInt(userDataRetention) <= 180 ? 'bg-yellow-400' : 
                  'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (1 - parseInt(userDataRetention) / 730) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Reset to Defaults
        </Button>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center"
        >
          <Save size={16} className="mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
} 