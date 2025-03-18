import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/products - Get all products
export async function GET() {
  try {
    await dbConnect();
    const products = await ProductModel.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      products 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'description', 'category', 'image', 'stock'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    await dbConnect();
    
    const newProduct = new ProductModel({
      name: body.name,
      price: body.price,
      description: body.description,
      category: body.category,
      image: body.image,
      stock: body.stock
    });
    
    await newProduct.save();
    
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
} 