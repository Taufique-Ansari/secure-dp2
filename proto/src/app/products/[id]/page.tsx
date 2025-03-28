import { getProduct } from '@/lib/products';
import ProductDetail from '@/components/product/ProductDetail';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: Props) {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    
    if (!product) {
      return notFound();
    }

    // Convert MongoDB document to plain object and handle dates
    const serializedProduct = {
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex justify-center">
            <ProductDetail product={serializedProduct} size="large" />
          </div>
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    return notFound();
  }
} 