
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserRole } from '@/lib/auth';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  school: string;
  status: "Activo" | "Pendiente" | "Inactivo";
  grade?: string;
  course?: string;
};

type NewUser = Omit<User, 'id' | 'status'> & {
    password?: string;
};

interface UsersContextType {
  users: User[];
  addUser: (user: NewUser) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  enableUser: (userId: string) => Promise<void>;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (userData: NewUser) => {
    try {
      const newUser: Omit<User, 'id'> = {
          ...userData,
          status: "Pendiente",
      }
      const docRef = await addDoc(collection(db, 'users'), newUser);
      setUsers(prevUsers => [...prevUsers, { ...newUser, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user from Firestore:", error);
    }
  };
  
  const enableUser = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: "Activo" });
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: "Activo" }
            : user
        )
      );
    } catch (error) {
      console.error("Error enabling user in Firestore:", error);
    }
  };

  return (
    <UsersContext.Provider value={{ users, addUser, deleteUser, enableUser, loading }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
