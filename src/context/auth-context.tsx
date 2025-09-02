
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { User as AppUser, UserRole } from './users-context';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a temporary solution for the demo to associate a Firestore user with a session.
// In a real app, Firebase Auth would be fully integrated with email/password, social logins, etc.
const MOCK_USER_SESSION_KEY = 'currentUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
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

  const value = { user, firebaseUser, loading };

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

// Mock login function
export const mockLogin = (user: AppUser) => {
    sessionStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify(user));
    // In a real app, this would trigger a re-render or context update
    window.location.href = '/dashboard';
}

// Mock logout function
export const mockLogout = () => {
    sessionStorage.removeItem(MOCK_USER_SESSION_KEY);
     window.location.href = '/';
}
