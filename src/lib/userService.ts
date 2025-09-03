'use server';

import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from './firebase';
import type { User as AppUser } from "@/context/users-context";


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

// Seed the database with an initial user - internal use
export async function seedUser(userData: Omit<AppUser, 'id'>) {
    if (!db) {
        console.error("Firestore database is not initialized.");
        return;
    }
    try {
        await addDoc(collection(db, "users"), userData);
    } catch (error) {
        console.error("Error seeding user:", error);
    }
}
