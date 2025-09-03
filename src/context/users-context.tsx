
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

// This initial data simulates what would come from a database.
const initialUsers: User[] = [
    { id: '1', name: 'Laura Martinez', email: 'laura.martinez@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 123', status: 'Activo', grade: '3er Grado', course: 'A' },
    { id: '2', name: 'Carlos Gomez', email: 'carlos.gomez@chubut.edu.ar', role: 'Director', school: 'Escuela N° 456', status: 'Activo' },
    { id: '3', name: 'Ana Fernandez', email: 'ana.fernandez@chubut.edu.ar', role: 'Referente', school: 'Distrito I', status: 'Activo' },
    { id: '4', name: 'Admin General', email: 'admin@chubut.edu.ar', role: 'Administrador', school: 'Ministerio', status: 'Activo' },
    { id: '5', name: 'Usuario Pendiente', email: 'pendiente@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 789', status: 'Pendiente' },
];


interface UsersContextType {
  users: User[];
  addUser: (user: NewUser) => { success: boolean; message: string };
  deleteUser: (userId: string) => void;
  enableUser: (userId: string) => void;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading] = useState(false); 

  const addUser = (userData: NewUser): { success: boolean; message: string } => {
    // Check for duplicates
    if (users.some(user => user.email === userData.email)) {
        return { success: false, message: "Ya existe un usuario con este email." };
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      ...userData,
      status: "Pendiente",
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    return { success: true, message: "Usuario registrado exitosamente." };
  };

  const deleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };
  
  const enableUser = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, status: 'Activo' } : user
      )
    );
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
