'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, UserCheck, UserX, Mail, ShieldCheck, ShieldOff, RefreshCw, Eye } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
  orders: number;
  totalSpent: number;
}

export default function UsersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/users');
      return;
    }
    
    if (sessionStatus === 'authenticated' && !(session?.user as any)?.isAdmin) {
      router.push('/');
      return;
    }
    
    if (sessionStatus === 'authenticated') {
      fetchUsers();
    }
  }, [sessionStatus, session, router]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAdminStatus = async (userId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'toggleAdmin' }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update user');
      }
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isAdmin: !user.isAdmin } : user
      ));
      
      toast.success(data.message || 'User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (sessionStatus === 'loading' || (sessionStatus === 'authenticated' && loading)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 w-full md:w-64" />
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mt-2" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <Button 
            onClick={() => fetchUsers()} 
            variant="outline" 
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Users ({filteredUsers.length})</h2>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{user.orders}</TableCell>
                    <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.isAdmin ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Customer
                          </Badge>
                        )}
                        {user.isVerified && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAdminStatus(user._id)}
                          disabled={isUpdating}
                        >
                          {user.isAdmin ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-1" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* User Details Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              User Details - {selectedUser?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              View user details and activity
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">User Information</h3>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {selectedUser.email}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {selectedUser.isAdmin ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Customer
                      </Badge>
                    )}
                    {selectedUser.isVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Account Information</h3>
                  <p>Joined: {formatDate(selectedUser.createdAt)}</p>
                  <p>Last Login: {formatDate(selectedUser.lastLogin)}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Order Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold">{selectedUser.orders}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold">${selectedUser.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => toggleAdminStatus(selectedUser._id)}
                    disabled={isUpdating}
                  >
                    {selectedUser.isAdmin ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Remove Admin Status
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Grant Admin Status
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 