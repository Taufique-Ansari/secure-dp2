'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the response has the expected structure
        if (!data || !data.success || !Array.isArray(data.products)) {
          throw new Error('Invalid response format from API');
        }
        
        setProducts(data.products);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
            <div className="space-y-3 mt-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No products found.</p>
        <p className="text-sm text-gray-400 mt-2">Try seeding the database first.</p>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/seed');
              if (response.ok) {
                toast.success('Database seeded successfully');
                window.location.reload();
              } else {
                toast.error('Failed to seed database');
              }
            } catch (err) {
              toast.error('Error seeding database');
            }
          }}
          className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Seed Database
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}