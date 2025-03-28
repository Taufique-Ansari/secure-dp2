import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { generateVirtualAddress } from '@/lib/blockchain';

export async function GET() {
  console.log('Starting privacy status check...');
  
  try {
    // First, check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('No authenticated user found');
      return NextResponse.json({
        success: false, 
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    console.log('User authenticated, id:', session.user.id);
    
    // Next, connect to database
    try {
      await connectToDatabase();
      console.log('Connected to database');
    } catch (dbConnectError) {
      console.error('Database connection error:', dbConnectError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbConnectError instanceof Error ? dbConnectError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
    // Find the user
    try {
      const user = await UserModel.findById(session.user.id);
      
      if (!user) {
        console.log('User not found in database');
        return NextResponse.json({ 
          success: false,
          error: 'User not found' 
        }, { status: 404 });
      }
      
      console.log('User found in database:', user.email);
      
      // Prepare response with database values
      const consentStatus = Boolean(user.privacyConsent || false);
      const verificationStatus = 'pending';
      const transactionHash = user.lastPrivacyTransactionHash || '';
      const blockchainAddress = user.blockchainAddress || generateVirtualAddress(session.user.id);
      
      // Return the privacy status
      return NextResponse.json({
        success: true,
        consent: consentStatus,
        verificationStatus,
        transactionHash,
        blockchainAddress,
        isBlockchainIntegrated: !!blockchainAddress
      });
    } catch (findUserError) {
      console.error('Error finding user:', findUserError);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: findUserError instanceof Error ? findUserError.message : 'Unknown database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('General error in privacy status API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 