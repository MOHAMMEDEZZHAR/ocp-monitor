'use client';

import { SessionProvider } from 'next-auth/react';
import { SessionExpiryHandler } from './session-expiry-handler';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionExpiryHandler />
      {children}
    </SessionProvider>
  );
}
