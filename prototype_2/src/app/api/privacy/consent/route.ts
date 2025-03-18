import { NextResponse } from 'next/server';
import { web3, privacyContract } from '@/lib/blockchain';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { consent } = await req.json();
        
        // Get user ID from session
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const userId = session.user.id || 'anonymous';

        const account = web3.eth.accounts.privateKeyToAccount(process.env.ETHEREUM_PRIVATE_KEY);
        
        // Store consent on blockchain for verification
        const tx = await privacyContract.methods
            .setUserConsent(consent)
            .send({ from: account.address });

        return NextResponse.json({
            success: true,
            transactionHash: tx.transactionHash // Proof of consent
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error updating privacy consent' },
            { status: 500 }
        );
    }
} 