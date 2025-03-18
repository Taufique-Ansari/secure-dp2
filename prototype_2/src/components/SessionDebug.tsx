'use client';

import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();

  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs max-w-md overflow-auto max-h-60">
        <div>Status: {status}</div>
        <div>Session: <pre>{JSON.stringify(session, null, 2)}</pre></div>
      </div>
    );
  }

  return null;
} 