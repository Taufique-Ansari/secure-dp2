import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    isAdmin?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      isAdmin: boolean;
    }
  }

  interface JWT {
    id: string;
    isAdmin: boolean;
  }
} 