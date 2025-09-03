
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UserRole } from '@/lib/auth';
import { getAllUsers, seedUser } from '@/lib/userService'; // Import Firestore functions

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

const initialUsers: Omit<User, 'id'>[] = [
    { name: 'Laura Martinez', email: 'laura.martinez@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Activo', password: '123' },
    { name: 'Carlos Gomez', email: 'carlos.gomez@chubut.edu.ar', role: 'Director', school: 'Escuela N° 456', status: 'Activo', password: '123' },
    { name: 'Ana Fernandez', email: 'ana.fernandez@chubut.edu.ar', role: 'Referente', school: 'Distrito I', status: 'Activo', password: '123' },
    { name: 'Admin General', email: 'admin@chubut.edu.ar', role: 'Administrador', school: 'Ministerio', status: 'Activo', password: '123' },
    { name: 'Usuario Pendiente', email: 'pendiente@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 789', status: 'Pendiente', password: '123' },
    { name: 'Evaluador General', email: 'evaluador@chubut.edu.ar', role: 'Evaluador', school: 'Sistema', status: 'Activo', password: 'hdsp6032' },
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seedDatabase = async () => {
        const existingUsers = await getAllUsers();
        if (existingUsers.length === 0) {
            console.log("Seeding database with initial users...");
            for (const user of initialUsers) {
                await seedUser(user);
            }
            // After seeding, fetch again to populate the context
             const allUsers = await getAllUsers();
             setUsers(allUsers);
        } else {
             setUsers(existingUsers);
        }
        setLoading(false);
    };
    
    seedDatabase();
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
