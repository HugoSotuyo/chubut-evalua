
'use server';

import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from './firebase';
import type { User, UserRole } from "./auth";

type NewUserPayload = {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    school: string;
    status: "Activo" | "Pendiente" | "Inactivo";
    grade?: string;
    course?: string;
};

// Find a user by their email for login purposes
export async function findUserByEmail(email: string): Promise<User | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    return {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        school: userData.school,
        status: userData.status,
        grade: userData.grade,
        course: userData.course,
    };
}

// Add a new user to the database during registration
export async function addUser(userData: NewUserPayload): Promise<{ success: boolean; message: string; }> {
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
