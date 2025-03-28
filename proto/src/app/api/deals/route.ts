import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';

interface Product {
  _id: any;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

// Sample deals data with dynamic product IDs
const dealsData = [
  {
    id: '1',
    title: 'Flash Sale - 24 Hours Only',
    description: 'Get up to 50% off on selected electronics',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
    discount: '50%',
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    category: 'Electronics',
    productIds: [] // Will be filled dynamically
  },
  {
    id: '2',
    title: 'Weekend Special',
    description: 'Buy one get one free on all clothing items',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
    discount: 'BOGO',
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    category: 'Clothing',
    productIds: [] // Will be filled dynamically
  },
  {
    id: '3',
    title: 'Clearance Sale',
    description: 'Up to 70% off on last season items',
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800',
    discount: '70%',
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    category: 'Various',
    productIds: [] // Will be filled dynamically
  },
  {
    id: '4',
    title: 'Back to School',
    description: 'Special discounts on books and stationery',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    discount: '30%',
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    category: 'Books',
    productIds: [] // Will be filled dynamically
  },
  {
    id: '5',
    title: 'Summer Sale',
    description: 'Hot deals on summer essentials',
    image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800',
    discount: '40%',
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    category: 'Various',
    productIds: [] // Will be filled dynamically
  }
];

export async function GET() {
  try {
    await dbConnect();
    
    // Get all products
    const productsData = await ProductModel.find({}).lean();
    const products = productsData as unknown as Product[];
    
    // Create a map of category to product IDs
    const categoryProductMap: Record<string, any[]> = products.reduce((acc: Record<string, any[]>, product: Product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product._id);
      return acc;
    }, {});
    
    // Assign product IDs to deals based on category
    const deals = dealsData.map(deal => {
      const productIds = deal.category === 'Various'
        ? products.slice(0, 5).map(p => p._id) // For 'Various', take first 5 products
        : (categoryProductMap[deal.category] || []).slice(0, 5); // Take up to 5 products from the category
      
      return {
        ...deal,
        productIds,
        productCount: productIds.length
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      deals 
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
} 