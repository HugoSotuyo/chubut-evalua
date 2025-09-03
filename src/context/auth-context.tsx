
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as AppUser } from './users-context';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER_SESSION_KEY = 'currentUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserJson = sessionStorage.getItem(MOCK_USER_SESSION_KEY);
    if (storedUserJson) {
        try {
            const storedUser = JSON.parse(storedUserJson);
            setUser(storedUser);
        } catch (e) {
            console.error("Could not parse stored user:", e);
            sessionStorage.removeItem(MOCK_USER_SESSION_KEY);
        }
    }
    setLoading(false);
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock logout function remains for convenience in other parts of the app
export const mockLogout = () => {
    sessionStorage.removeItem(MOCK_USER_SESSION_KEY);
     window.location.href = '/';
}
