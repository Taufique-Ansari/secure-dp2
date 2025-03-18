import { useSession } from 'next-auth/react';

export function useAdmin() {
  const { data: session } = useSession();
  // Explicitly check for true to avoid any type coercion issues
  return session?.user?.isAdmin === true;
} 