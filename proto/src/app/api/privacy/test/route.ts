import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { privacyContract, web3 } from '@/lib/blockchain';
import { generateVirtualAddress } from '@/lib/blockchain';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAddress = generateVirtualAddress(session.user.id);
    
    // Generate test data - use only integers for blockchain (uint256)
    // Epsilon: 1-10 as a whole number
    const epsilon = Math.floor(Math.random() * 10) + 1;
    // Delta: 0-99 as a whole number (representing 0%-9.9%)
    const delta = Math.floor(Math.random() * 100);
    // Hash random data for testing
    const dataHash = web3.utils.keccak256(
      web3.utils.utf8ToHex(`User data processing ${Date.now()}`)
    );

    console.log('Test parameters:', { epsilon, delta });

    // Get the account from MetaMask
    try {
      const accounts = await web3.eth.getAccounts();
      
      if (!accounts || accounts.length === 0) {
        return NextResponse.json({ 
          error: 'No blockchain account available',
          details: 'Please connect your MetaMask wallet to create records'
        }, { status: 400 });
      }
      
      const fromAddress = accounts[0];
      console.log('Using address for transaction:', fromAddress);
      
      // Add record to blockchain - make sure we're sending proper integer values
      const result = await privacyContract.methods
        .setPrivacyParameters(
          web3.utils.toBN(epsilon),  // Convert to BN to ensure proper uint256 format
          web3.utils.toBN(delta),    // Convert to BN to ensure proper uint256 format
          dataHash
        )
        .send({ 
          from: fromAddress,
          gas: 200000
        });

      return NextResponse.json({
        success: true,
        transactionHash: result.transactionHash,
        record: {
          epsilon,
          delta,
          dataHash,
          timestamp: Math.floor(Date.now() / 1000)
        }
      });
    } catch (error) {
      console.error('Error creating test record:', error);
      return NextResponse.json({ 
        error: 'Failed to create test record',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 