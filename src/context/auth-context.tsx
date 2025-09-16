
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { updateUserPasswordInDb, updateUserInDb } from '@/lib/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUser: (updatedUser: User) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER_SESSION_KEY = 'currentUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const storedUserJson = sessionStorage.getItem(MOCK_USER_SESSION_KEY);
        if (storedUserJson) {
            const storedUser = JSON.parse(storedUserJson);
            setUser(storedUser);
        }
    } catch (e) {
        console.error("Could not parse stored user:", e);
        sessionStorage.removeItem(MOCK_USER_SESSION_KEY);
    } finally {
        setLoading(false);
    }
  }, []);
  
  const updateUser = async (updatedUser: User) => {
    if (!user || user.id !== updatedUser.id) {
      throw new Error("Unauthorized update attempt.");
    }
    await updateUserInDb(updatedUser);
    setUser(updatedUser);
    sessionStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify(updatedUser));
  };


  const updateUserPassword = async (newPassword: string) => {
    if (!user) {
      throw new Error("No user is currently logged in.");
    }
    await updateUserPasswordInDb(user.id, newPassword);
    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);
    sessionStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify(updatedUser));
  };


  const value = { user, loading, updateUser, updateUserPassword };

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

export const mockLogout = () => {
    sessionStorage.removeItem(MOCK_USER_SESSION_KEY);
    window.location.href = '/';
};

    