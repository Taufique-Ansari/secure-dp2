import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { generateVirtualAddress } from '@/lib/blockchain';

export async function POST(req: Request) {
  try {
    console.log('Starting consent update...');
    
    await connectToDatabase();
    const { consent } = await req.json();
    console.log('Consent value received:', consent);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('No authenticated user found');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    console.log('User authenticated, id:', session.user.id);
    
    // Update user in database
    const user = await UserModel.findById(session.user.id);
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }
    
    console.log('User found in database:', user.email);
    
    // Update consent in database
    user.privacyConsent = consent;
    
    // Generate virtual address if needed
    if (!user.blockchainAddress) {
      user.blockchainAddress = generateVirtualAddress(session.user.id);
      console.log('Generated blockchain address:', user.blockchainAddress);
    }
    
    // Save the user
    await user.save();
    console.log('User saved with updated consent:', consent);
    
    return NextResponse.json({
      success: true,
      consent,
      message: 'Consent updated in database'
    });
    
  } catch (error) {
    console.error('Error updating consent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update consent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 