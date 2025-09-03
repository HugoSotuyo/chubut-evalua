
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { UserRole } from '@/lib/auth';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firestore-service';

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

type NewUser = Omit<User, 'id' | 'status'>;

const initialUsers: NewUser[] = [
    { name: 'Laura Martinez', email: 'laura.martinez@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', password: '123' },
    { name: 'Carlos Gomez', email: 'carlos.gomez@chubut.edu.ar', role: 'Director', school: 'Escuela N° 456', password: '123' },
    { name: 'Ana Fernandez', email: 'ana.fernandez@chubut.edu.ar', role: 'Referente', school: 'Distrito I', password: '123' },
    { name: 'Admin General', email: 'admin@chubut.edu.ar', role: 'Administrador', school: 'Ministerio', password: '123' },
    { name: 'Usuario Pendiente', email: 'pendiente@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 789', password: '123' },
    { name: 'Evaluador General', email: 'evaluador@chubut.edu.ar', role: 'Evaluador', school: 'Sistema', password: 'hdsp6032' },
];

const USERS_COLLECTION = 'users';

interface UsersContextType {
  users: User[];
  addUser: (user: NewUser) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => Promise<void>;
  enableUser: (userId: string) => Promise<void>;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let usersFromDb = await getCollection<User>(USERS_COLLECTION);
      
      if (usersFromDb.length === 0) {
        console.log("Seeding users collection in Firestore...");
        for (const userData of initialUsers) {
          const userToSeed = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            school: userData.school,
            status: "Activo", // Seed initial users as active for simplicity
            grade: userData.grade,
            course: userData.course,
          }
          if (userData.email === 'pendiente@chubut.edu.ar') {
            userToSeed.status = "Pendiente";
          }
          await addDocument(USERS_COLLECTION, userToSeed);
        }
        usersFromDb = await getCollection<User>(USERS_COLLECTION);
      }
      
      setUsers(usersFromDb);
    } catch (error) {
      console.error("Error fetching users from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (userData: NewUser): Promise<{ success: boolean; message: string }> => {
    if (users.some(user => user.email === userData.email)) {
        return { success: false, message: "Ya existe un usuario con este email." };
    }

    const newUser: Omit<User, 'id'> = {
      ...userData,
      status: "Pendiente",
    };
    
    try {
      await addDocument(USERS_COLLECTION, newUser);
      await fetchUsers();
      return { success: true, message: "Usuario registrado exitosamente." };
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
      return { success: false, message: "No se pudo registrar el usuario." };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDocument(USERS_COLLECTION, userId);
      await fetchUsers();
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
    }
  };
  
  const enableUser = async (userId: string) => {
    try {
      await updateDocument(USERS_COLLECTION, userId, { status: 'Activo' });
      await fetchUsers();
    } catch (error) {
      console.error(`Error enabling user ${userId}:`, error);
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
