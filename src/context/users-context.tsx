

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserStatusInDb, deleteUserFromDb, addUser as addUserToDb, updateUserInDb, updateUserPasswordInDb, findDirectorBySchool } from '@/lib/userService'; 
import type { User } from "@/lib/types";
import { useAuditLogs } from './audit-log-context';

type NewUserPayload = Omit<User, 'id' | 'status' | 'fcmTokens'>;

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
  const { addAuditLog } = useAuditLogs();
  
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
        await addAuditLog({ action: "ALTA_USUARIO_PENDIENTE", details: `Se registró el usuario "${result.newUser.email}" (${result.newUser.role}), pendiente de habilitación.` });
        setUsers(prevUsers => [...prevUsers, result.newUser!]);

        if (result.newUser.role === 'Docente') {
          const director = await findDirectorBySchool(result.newUser.school, result.newUser.schoolYear);
          if (director) {
              fetch('/api/send-notification', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ directorId: director.id, newUserName: result.newUser.name }),
              });
          }
        }
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
        await addAuditLog({ action: "EDITAR_USUARIO", details: `Se editaron los datos del usuario "${userData.email}".` });
        await refreshUsers();
    } catch (error) {
        console.error(`Failed to update user ${userData.id}:`, error);
        throw error;
    }
  };

  const updateUserPassword = async (userId: string, newPassword: string) => {
    try {
        const userToUpdate = users.find(u => u.id === userId);
        await updateUserPasswordInDb(userId, newPassword);
        if (userToUpdate) {
            await addAuditLog({ action: "CAMBIAR_CONTRASENA", details: `Se cambió la contraseña para el usuario "${userToUpdate.email}".` });
        }
        await refreshUsers(); // Refresh to get the new "Activo" status
    } catch (error) {
        console.error(`Failed to update password for user ${userId}:`, error);
        throw error;
    }
  };


  const deleteUser = async (userId: string) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      await deleteUserFromDb(userId);
      if (userToDelete) {
        await addAuditLog({ action: "ELIMINAR_USUARIO", details: `Se eliminó el usuario "${userToDelete.email}".` });
      }
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error; // Re-throw to be caught in the component for user feedback
    }
  };
  
  const enableUser = async (userId: string) => {
    try {
      const userToEnable = users.find((user) => user.id === userId);
      await updateUserStatusInDb(userId, "Activo");
      if (userToEnable) {
        await addAuditLog({ action: "HABILITAR_USUARIO", details: `Se habilitó el usuario "${userToEnable.email}".` });
      }
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
