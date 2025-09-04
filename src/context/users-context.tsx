
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAllUsers, updateUserStatusInDb } from '@/lib/userService'; 
import type { User } from "@/lib/types";

interface UsersContextType {
  users: User[];
  deleteUser: (userId: string) => void;
  enableUser: (userId: string) => Promise<void>;
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
  
  const updateUsersInState = (newUsers: User[]) => {
    setUsers(newUsers);
  };

  const deleteUser = (userId: string) => {
    // TODO: This should call a Firestore delete function
    const newUsers = users.filter(user => user.id !== userId);
    updateUsersInState(newUsers);
  };
  
  const enableUser = async (userId: string) => {
    try {
      await updateUserStatusInDb(userId, "Activo");
      const newUsers = users.map(user => 
          user.id === userId ? { ...user, status: "Activo" as const } : user
      );
      updateUsersInState(newUsers);
    } catch (error) {
      console.error("Failed to enable user:", error);
      // Optionally, show a toast notification to the user about the failure
    }
  };

  return (
    <UsersContext.Provider value={{ users, deleteUser, enableUser, loading }}>
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
