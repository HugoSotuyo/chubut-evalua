
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAllUsers, updateUserStatusInDb, deleteUserFromDb, addUser as addUserToDb } from '@/lib/userService'; 
import type { User } from "@/lib/types";

type NewUserPayload = Omit<User, 'id' | 'status'>;

interface UsersContextType {
  users: User[];
  addUser: (userData: NewUserPayload) => Promise<{ success: boolean; message: string; }>;
  deleteUser: (userId: string) => Promise<void>;
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

  const addUser = async (userData: NewUserPayload) => {
    try {
      const result = await addUserToDb(userData);
      if (result.success && result.newUser) {
        setUsers(prevUsers => [...prevUsers, result.newUser!]);
      }
      return { success: result.success, message: result.message };
    } catch (error) {
       console.error("Error adding user via context:", error);
       return { success: false, message: "Ocurrió un error en el servidor." };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserFromDb(userId);
      const newUsers = users.filter(user => user.id !== userId);
      updateUsersInState(newUsers);
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw error; // Re-throw to be caught in the component for user feedback
    }
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
      throw error;
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
