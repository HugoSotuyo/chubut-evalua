
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAllUsers } from '@/lib/userService'; 
import type { User } from "@/lib/types";

type NewUser = Omit<User, 'id' | 'status'>;

interface UsersContextType {
  users: User[];
  addUser: (user: NewUser) => { success: boolean; message: string };
  deleteUser: (userId: string) => void;
  enableUser: (userId: string) => void;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users in context:", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchUsers();
  }, []);
  
  const updateUsersInStateAndStorage = (newUsers: User[]) => {
    // This function will now only update the local state.
    // Firestore updates will be handled by specific service functions.
    setUsers(newUsers);
  };


  const addUser = (userData: NewUser): { success: boolean; message: string } => {
    // This context function is now primarily for local state management, 
    // the actual DB operation is in register-form.
    // However, we can update the local state to reflect the change immediately.
    const newUser: User = {
      id: `temp-${Date.now()}`, // temporary ID
      ...userData,
      status: "Pendiente",
    };
    
    setUsers(prev => [...prev, newUser]);
    // The success message will come from the server action in the form
    return { success: true, message: "Usuario registrado. Actualizando lista local." };
  };

  const deleteUser = (userId: string) => {
    // TODO: This should call a Firestore delete function
    const newUsers = users.filter(user => user.id !== userId);
    updateUsersInStateAndStorage(newUsers);
  };
  
  const enableUser = (userId: string) => {
    // TODO: This should call a Firestore update function
    const newUsers = users.map(user => 
        user.id === userId ? { ...user, status: "Activo" as const } : user
    );
    updateUsersInStateAndStorage(newUsers);
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
