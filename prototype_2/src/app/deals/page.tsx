'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';

interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  endTime: string;
  category: string;
  productIds: string[];
  productCount: number;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/deals');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch deals');
        }
        
        setDeals(data.deals);
        setError(null);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError('Failed to load deals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Function to calculate time remaining
  const getTimeRemaining = (endTime: string) => {
    const total = new Date(endTime).getTime() - Date.now();
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m remaining`;
    } else {
      return 'Ending soon!';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Special Deals & Offers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Special Deals & Offers</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Special Deals & Offers</h1>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-4">No active deals at the moment</h3>
          <p className="text-gray-500 mb-6">Check back soon for exciting offers!</p>
          <Link href="/">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Special Deals & Offers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image 
                src={deal.image} 
                alt={deal.title}
                fill
                className="object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-red-500">
                {deal.discount}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>{deal.title}</CardTitle>
              <CardDescription>{deal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-sm">
                  {deal.category}
                </Badge>
                <span className="text-sm font-medium text-amber-600">
                  {getTimeRemaining(deal.endTime)}
                </span>
              </div>
              <p className="text-sm mt-2">
                {deal.productCount} products included
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/products?deal=${deal.id}`} className="w-full">
                <Button className="w-full">View Deal Products</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 