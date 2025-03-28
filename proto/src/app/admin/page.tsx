'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const isAdmin = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session && session.user && session.user.isAdmin !== true) {
      router.push('/');
    }
  }, [session, status, isAdmin, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session?.user?.isAdmin !== true) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
      <p>You need admin privileges to view this page.</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <p className="mb-4">Add, edit, or remove products from your store.</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => router.push('/admin/products')}
          >
            Manage Products
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Management</h2>
          <p className="mb-4">View and manage customer orders.</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => router.push('/admin/orders')}
          >
            Manage Orders
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="mb-4">Manage user accounts and permissions.</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => router.push('/admin/users')}
          >
            Manage Users
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
          <p className="mb-4">Configure differential privacy and blockchain settings.</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => router.push('/admin/privacy')}
          >
            Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
} 