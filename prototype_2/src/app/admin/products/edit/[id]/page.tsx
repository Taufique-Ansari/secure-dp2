'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
}

type PageProps = {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const isAdmin = useAdmin();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [productId, setProductId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    stock: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session?.user?.isAdmin !== true) {
      router.push('/');
      return;
    }

    // Set the product ID from params
    // In Next.js 15, params is a Promise, but for backward compatibility
    // we can still access it synchronously for now
    if (params && typeof params === 'object' && 'id' in params) {
      setProductId(params.id as string);
    } else if (params && typeof params.then === 'function') {
      // Handle Promise if needed in the future
      params.then(resolvedParams => {
        setProductId(resolvedParams.id);
      });
    }
  }, [session, status, isAdmin, router, params]);

  const fetchProduct = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch product');
      }
      
      const product = data.product;
      
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        category: product.category,
        image: product.image,
        stock: product.stock.toString()
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again.');
    } finally {
      setFetchLoading(false);
    }
  }, [productId]);

  // Separate useEffect for fetching product after productId is set
  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.name || !formData.price || !formData.description || !formData.category || !formData.image || !formData.stock) {
        toast.error('Please fill in all fields');
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      toast.error('Error updating product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetchLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/admin/products" className="text-primary hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  if (session?.user?.isAdmin !== true) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
      <p>You need admin privileges to view this page.</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/products" className="flex items-center text-primary hover:underline">
          <ArrowLeft size={16} className="mr-1" />
          Back to Products
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Beauty">Beauty</option>
                <option value="Toys">Toys</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Product preview" 
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter product description"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 