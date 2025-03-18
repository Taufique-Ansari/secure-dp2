'use client';

import { useSession } from 'next-auth/react';
import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const isAdmin = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.push('/');
    }
  }, [status, isAdmin, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid gap-4">
        {/* Add your admin dashboard content here */}
        <div className="p-4 border rounded">
          <h2 className="font-semibold">User Management</h2>
          {/* Add user management UI */}
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Privacy Settings</h2>
          {/* Add privacy settings UI */}
        </div>
      </div>
    </div>
  );
} 