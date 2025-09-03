
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

const initialUsers: User[] = [
    { id: '1', name: 'Laura Martinez', email: 'laura.martinez@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 123', status: 'Activo', grade: '3er Grado', course: 'A', password: '123' },
    { id: '2', name: 'Carlos Gomez', email: 'carlos.gomez@chubut.edu.ar', role: 'Director', school: 'Escuela N° 456', status: 'Activo', password: '123' },
    { id: '3', name: 'Ana Fernandez', email: 'ana.fernandez@chubut.edu.ar', role: 'Referente', school: 'Distrito I', status: 'Activo', password: '123' },
    { id: '4', name: 'Admin General', email: 'admin@chubut.edu.ar', role: 'Administrador', school: 'Ministerio', status: 'Activo', password: '123' },
    { id: '5', name: 'Usuario Pendiente', email: 'pendiente@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 789', status: 'Pendiente', password: '123' },
    { id: 'evaluador-master', name: 'Evaluador General', email: 'evaluador@chubut.edu.ar', role: 'Evaluador', school: 'Sistema', status: 'Activo', password: 'hdsp6032' },
];


interface UsersContextType {
  users: User[];
  addUser: (user: NewUser) => { success: boolean; message: string };
  deleteUser: (userId: string) => void;
  enableUser: (userId: string) => void;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'chubut_evalua_users';

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(initialUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setUsers(initialUsers);
    }
    setLoading(false);
  }, []);

  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
    } catch (error) {
        console.error("Failed to save users to localStorage:", error);
    }
  };

  const addUser = (userData: NewUser): { success: boolean; message: string } => {
    if (users.some(user => user.email === userData.email)) {
        return { success: false, message: "Ya existe un usuario con este email." };
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      ...userData,
      status: "Pendiente",
    };
    
    updateUsers([...users, newUser]);
    return { success: true, message: "Usuario registrado exitosamente." };
  };

  const deleteUser = (userId: string) => {
    const newUsers = users.filter(user => user.id !== userId);
    updateUsers(newUsers);
  };
  
  const enableUser = (userId: string) => {
    const newUsers = users.map(user =>
        user.id === userId ? { ...user, status: 'Activo' } : user
    );
    updateUsers(newUsers);
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
