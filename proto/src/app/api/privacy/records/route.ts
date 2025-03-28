import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { web3, privacyContract } from '@/lib/blockchain';
import { UserModel } from '@/models/User';
import { dbConnect } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Connect to database
    await dbConnect();
    
    // Find user in database
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Check if user has blockchain address
    if (!user.blockchainAddress) {
      return NextResponse.json({ 
        success: false, 
        message: 'User does not have blockchain integration',
        records: []
      });
    }

    // Get the privacy records from blockchain
    try {
      // In a real implementation, we would call:
      // const records = await privacyContract.methods.getUserPrivacyParameters(user.blockchainAddress).call();
      
      // For prototype, we'll generate mock data
      const mockRecords = [
        {
          epsilon: 0.1,
          delta: 0.001,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
          dataHash: web3.utils.sha3('Profile data processing - weekly analysis')
        },
        {
          epsilon: 0.2,
          delta: 0.005,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
          dataHash: web3.utils.sha3('Transaction data aggregation')
        },
        {
          epsilon: 0.05,
          delta: 0.0001,
          timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
          dataHash: web3.utils.sha3('Preference analysis')
        }
      ];

      return NextResponse.json({
        success: true,
        records: mockRecords
      });
    } catch (error) {
      console.error('Error fetching privacy records from blockchain:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch privacy records from blockchain',
        records: []
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in privacy records API:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      records: []
    }, { status: 500 });
  }
} 