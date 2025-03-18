import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { OrderModel } from '@/models/Order';
import { UserModel } from '@/models/User';

interface OrderItem {
  _id: any;
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: any;
  user: any;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
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
    
    // Fetch all orders from the database
    const ordersData = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
    const orders = ordersData as unknown as Order[];
    
    // Get all user IDs from the orders
    const userIdSet = new Set(orders.map(order => order.user.toString()));
    const userIds = Array.from(userIdSet);
    
    // Fetch all users in one query
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    
    // Create a map of user IDs to user objects for quick lookup
    const userMap: Record<string, any> = users.reduce((map: Record<string, any>, user: any) => {
      map[user._id.toString()] = user;
      return map;
    }, {});
    
    // Transform the orders to match the expected format in the frontend
    const formattedOrders = orders.map((order: Order) => {
      const user = userMap[order.user.toString()] || { name: 'Unknown', email: 'unknown@example.com' };
      
      // Format the shipping address
      const shippingAddress = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`;
      
      // Map order items to the expected format
      const items = order.orderItems.map((item: OrderItem) => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Determine the status based on isDelivered
      let status = 'pending';
      if (order.isDelivered) {
        status = 'delivered';
      }
      
      return {
        id: order._id.toString(),
        customer: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        },
        date: order.createdAt.toISOString(),
        status: status,
        items: items,
        total: order.totalPrice,
        shippingAddress: shippingAddress,
        paymentMethod: 'Credit Card', // Assuming default payment method
        notes: ''
      };
    });
    
    return NextResponse.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
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
    
    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'Order ID and status are required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Map frontend status to database fields
    let updateData = {};
    
    switch (status) {
      case 'delivered':
        updateData = { isDelivered: true, deliveredAt: new Date() };
        break;
      case 'processing':
      case 'confirmed':
      case 'shipped':
      case 'pending':
      case 'cancelled':
        // For now, we'll just store the status in a new field since the original schema doesn't have a status field
        updateData = { status: status, isDelivered: false };
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid status' },
          { status: 400 }
        );
    }
    
    // Update the order in the database
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Order ${orderId} status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
} 