import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UserModel } from '@/models/User';
import { OrderModel } from '@/models/Order';

interface User {
  _id: any;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Fetch all users from the database
    const usersData = await UserModel.find({}).lean();
    const users = usersData as unknown as User[];
    
    // Get all user IDs
    const userIds = users.map(user => user._id.toString());
    
    // Fetch order statistics for each user
    const orderStats = await OrderModel.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    // Create a map of user IDs to order stats for quick lookup
    const orderStatsMap: Record<string, { orders: number, totalSpent: number }> = orderStats.reduce((map: Record<string, any>, stat: any) => {
      map[stat._id.toString()] = {
        orders: stat.orderCount,
        totalSpent: stat.totalSpent
      };
      return map;
    }, {});
    
    // Transform the users to match the expected format in the frontend
    const formattedUsers = users.map((user: User) => {
      const stats = orderStatsMap[user._id.toString()] || { orders: 0, totalSpent: 0 };
      
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
        isVerified: true, // Assuming all users are verified
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
        lastLogin: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
        orders: stats.orders,
        totalSpent: stats.totalSpent
      };
    });
    
    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { userId, action } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, message: 'User ID and action are required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    let updateData = {};
    let successMessage = '';
    
    switch (action) {
      case 'toggleAdmin':
        // First get the current user to toggle the isAdmin status
        const user = await UserModel.findById(userId);
        if (!user) {
          return NextResponse.json(
            { success: false, message: 'User not found' },
            { status: 404 }
          );
        }
        
        updateData = { isAdmin: !user.isAdmin };
        successMessage = `User ${userId} admin status updated to ${!user.isAdmin}`;
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Update the user in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: successMessage,
      user: {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
} 