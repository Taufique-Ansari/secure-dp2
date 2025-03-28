import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';

// Define categories with images and descriptions
const categoriesData = [
  {
    id: 'electronics',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    description: 'Latest gadgets and electronic devices'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
    description: 'Fashion items for all seasons'
  },
  {
    id: 'books',
    name: 'Books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    description: 'Books across all genres'
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    description: 'Everything for your home'
  },
  {
    id: 'beauty',
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    description: 'Beauty and personal care products'
  },
  {
    id: 'sports',
    name: 'Sports',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    description: 'Sports equipment and accessories'
  }
];

export async function GET() {
  try {
    await dbConnect();
    
    // Get product counts for each category
    const categoryCounts = await ProductModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Create a map of category to count
    const countMap = categoryCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Combine the static category data with the dynamic product counts
    const categories = categoriesData.map(category => ({
      ...category,
      productCount: countMap[category.name] || 0
    }));
    
    return NextResponse.json({ 
      success: true, 
      categories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 