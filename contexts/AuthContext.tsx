"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { auth, onAuthStateChanged, signOut as firebaseSignOut } from '@/lib/firebase';

interface AuthContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  return (
    <AuthContext.Provider value={{ user: session?.user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
