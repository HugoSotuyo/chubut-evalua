
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '@/lib/auth';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely on a real backend
  role: UserRole;
  school: string;
  status: "Activo" | "Pendiente" | "Inactivo";
  grade?: string;
  course?: string;
};

type NewUser = Omit<User, 'id' | 'status' | 'avatar'> & {
    password?: string;
};

interface UsersContextType {
  users: User[];
  addUser: (user: NewUser) => void;
  deleteUser: (userId: string) => void;
  enableUser: (userId: string) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: "usr-001", name: "Ana Gomez", email: "ana.gomez@example.com", password: "password123", role: "Docente", school: "Escuela N° 101", status: "Activo", grade: "5to Grado", course: "A" },
    { id: "usr-002", name: "Carlos Diaz", email: "carlos.diaz@example.com", password: "password123", role: "Director", school: "Escuela N° 789", status: "Activo" },
    { id: "usr-003", name: "Lucia Fernandez", email: "lucia.fernandez@example.com", password: "password123", role: "Referente", school: "N/A", status: "Activo" },
    { id: "usr-004", name: "Marcos Torres", email: "marcos.torres@example.com", password: "password123", role: "Docente", school: "Escuela N° 101", status: "Pendiente", grade: "6to Grado", course: "B" },
    { id: "usr-005", name: "Sofia Reyes", email: "sofia.reyes@example.com", password: "password123", role: "Administrador", school: "N/A", status: "Activo" },
    { id: "usr-006", name: "Evaluador Principal", email: "evaluador@chubut.edu.ar", password: "hdsp6032", role: "Evaluador", school: "N/A", status: "Activo" },
];

const LOCAL_STORAGE_KEY = 'chubut-evalua-users';

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      setUsers(storedUsers ? JSON.parse(storedUsers) : initialUsers);
    } catch (error) {
      console.error("Error reading from localStorage", error);
      setUsers(initialUsers);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [users, isInitialized]);

  const addUser = (userData: NewUser) => {
    const newUser: User = {
        ...userData,
        id: `usr-${Date.now()}`,
        status: "Pendiente",
    }
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const deleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };
  
  const enableUser = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: "Activo" }
          : user
      )
    );
  };


  return (
    <UsersContext.Provider value={{ users, addUser, deleteUser, enableUser }}>
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
