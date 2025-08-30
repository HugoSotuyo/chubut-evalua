
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '@/lib/auth';

export type User = {
  id: string;
  name: string;
  role: UserRole;
  school: string;
  status: "Activo" | "Pendiente" | "Inactivo";
  avatar: string;
};

type NewUser = Omit<User, 'id' | 'status' | 'avatar'>;

interface UsersContextType {
  users: User[];
  addUser: (user: NewUser) => void;
  deleteUser: (userId: string) => void;
  enableUser: (userId: string) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: "usr-001", name: "Ana Gomez", role: "Docente", school: "Escuela N° 101", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user1" },
    { id: "usr-002", name: "Carlos Diaz", role: "Director", school: "Escuela N° 789", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user2" },
    { id: "usr-003", name: "Lucia Fernandez", role: "Referente", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user3" },
    { id: "usr-004", name: "Marcos Torres", role: "Docente", school: "Escuela N° 101", status: "Pendiente", avatar: "https://i.pravatar.cc/150?u=user4" },
    { id: "usr-005", name: "Sofia Reyes", role: "Administrador", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user5" },
    { id: "usr-006", name: "Evaluador Principal", role: "Evaluador", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=evaluador@chubut.edu.ar" },
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
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
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
