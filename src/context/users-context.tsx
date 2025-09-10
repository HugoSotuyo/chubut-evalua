
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserStatusInDb, deleteUserFromDb, addUser as addUserToDb, updateUserInDb, updateUserPasswordInDb } from '@/lib/userService'; 
import type { User } from "@/lib/types";

type NewUserPayload = Omit<User, 'id' | 'status'>;

interface UsersContextType {
  users: User[];
  addUser: (userData: NewUserPayload) => Promise<{ success: boolean; message: string; newUser?: User }>;
  updateUser: (userData: User) => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  enableUser: (userId: string) => Promise<void>;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refreshUsers = useCallback(async () => {
    setLoading(true);
    try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
    } catch (error) {
        console.error("Failed to fetch users in context:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);
  
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

  const updateUser = async (userData: User) => {
    try {
        await updateUserInDb(userData);
        await refreshUsers();
    } catch (error) {
        console.error(`Failed to update user ${userData.id}:`, error);
        throw error;
    }
  };

  const updateUserPassword = async (userId: string, newPassword: string) => {
    try {
        await updateUserPasswordInDb(userId, newPassword);
        // No es necesario refrescar los usuarios ya que la contraseña no se muestra
    } catch (error) {
        console.error(`Failed to update password for user ${userId}:`, error);
        throw error;
    }
  };


  const deleteUser = async (userId: string) => {
    try {
      await deleteUserFromDb(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw error; // Re-throw to be caught in the component for user feedback
    }
  };
  
  const enableUser = async (userId: string) => {
    try {
      await updateUserStatusInDb(userId, "Activo");
       setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId ? { ...user, status: "Activo" as const } : user
      ));
    } catch (error) {
      console.error("Failed to enable user:", error);
      throw error;
    }
  };

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, updateUserPassword, deleteUser, enableUser, loading }}>
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

    