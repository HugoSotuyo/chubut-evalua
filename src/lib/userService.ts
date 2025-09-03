
'use server';

import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from './firebase';
import type { User as AppUser } from "@/context/users-context";

const initialUsers: Omit<AppUser, 'id'>[] = [
    { name: 'Laura Martinez', email: 'laura.martinez@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Activo', password: '123' },
    { name: 'Carlos Gomez', email: 'carlos.gomez@chubut.edu.ar', role: 'Director', school: 'Escuela N° 456', status: 'Activo', password: '123' },
    { name: 'Ana Fernandez', email: 'ana.fernandez@chubut.edu.ar', role: 'Referente', school: 'Distrito I', status: 'Activo', password: '123' },
    { name: 'Admin General', email: 'admin@chubut.edu.ar', role: 'Administrador', school: 'Ministerio', status: 'Activo', password: '123' },
    { name: 'Usuario Pendiente', email: 'pendiente@chubut.edu.ar', role: 'Docente', school: 'Escuela N° 789', status: 'Pendiente', password: '123' },
    { name: 'Evaluador General', email: 'evaluador@chubut.edu.ar', role: 'Evaluador', school: 'Sistema', status: 'Activo', password: 'hdsp6032' },
];


// This is not a standard User type, it's a payload for creation.
type NewUserPayload = {
    name: string;
    email: string;
    password?: string;
    role: AppUser['role'];
    school: string;
    status: AppUser['status'];
    grade?: string;
    course?: string;
};

// Find a user by their email for login purposes
export async function findUserByEmail(email: string): Promise<AppUser | null> {
    if (!db) {
        console.error("Firestore database is not initialized.");
        return null;
    }
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    
    try {
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        return {
            id: userDoc.id,
            ...userData
        } as AppUser;

    } catch (error) {
        console.error("Error finding user by email:", error);
        return null;
    }
}

// Add a new user to the database during registration
export async function addUser(userData: NewUserPayload): Promise<{ success: boolean; message: string; }> {
    if (!db) {
        console.error("Firestore database is not initialized.");
        return { success: false, message: "La base de datos no está inicializada." };
    }
    try {
        const existingUser = await findUserByEmail(userData.email);
        if (existingUser) {
            return { success: false, message: "Ya existe un usuario con este email." };
        }

        await addDoc(collection(db, "users"), userData);
        return { success: true, message: "Usuario registrado exitosamente." };
    } catch (error) {
        console.error("Error adding user: ", error);
        return { success: false, message: "Ocurrió un error al registrar el usuario." };
    }
}

// Get all users from the database
export async function getAllUsers(): Promise<AppUser[]> {
    if (!db) {
        console.error("Firestore database is not initialized.");
        return [];
    }
    const users: AppUser[] = [];
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as AppUser);
        });
    } catch (error) {
        console.error("Error getting all users:", error);
    }
    return users;
}

// Seed the database with initial users.
export async function seedInitialUsers() {
    if (!db) {
        console.error("Firestore database is not initialized.");
        return;
    }
    try {
        console.log('Seeding database with', initialUsers.length, 'users.');
        for (const user of initialUsers) {
             await addDoc(collection(db, "users"), user);
        }
        console.log('Seeding complete.');
    } catch (error) {
        console.error("Error seeding users:", error);
    }
}
