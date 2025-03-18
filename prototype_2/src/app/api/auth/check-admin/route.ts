import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { UserModel } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { isAdmin: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { isAdmin: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { isAdmin: false, message: 'Error checking admin status' },
      { status: 500 }
    );
  }
} 