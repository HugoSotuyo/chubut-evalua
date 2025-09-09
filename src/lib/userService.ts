
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { User } from "./types";
import { getAllSchools, getAllDistricts } from "./schoolsService"; // Import from the correct service

// Firebase configuration - directly in the server file
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Singleton pattern for Firebase initialization
let app: FirebaseApp;
let db: Firestore;

function getDb() {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    db = getFirestore(app);
    return db;
}


const initialUsers: Omit<User, 'id'>[] = [
    { name: 'Laura Martinez', email: 'laura.martinez@chubut.edu.ar', dni: '30123456', role: 'Docente', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Activo', password: '123' },
    { name: 'Carlos Gomez', email: 'carlos.gomez@chubut.edu.ar', dni: '25123456', role: 'Director', school: 'Escuela N° 456', status: 'Activo', password: '123' },
    { name: 'Ana Fernandez', email: 'ana.fernandez@chubut.edu.ar', dni: '28123456', role: 'Referente', school: 'Distrito I', status: 'Activo', password: '123' },
    { name: 'Admin General', email: 'admin@chubut.edu.ar', dni: '20123456', role: 'Administrador', school: 'Ministerio', status: 'Activo', password: '123' },
    { name: 'Usuario Pendiente', email: 'pendiente@chubut.edu.ar', dni: '35123456', role: 'Docente', school: 'Escuela N° 789', status: 'Pendiente', password: '123' },
    { name: 'Evaluador General', email: 'evaluador@chubut.edu.ar', dni: '1', role: 'Evaluador', school: 'Sistema', status: 'Activo', password: 'hdsp6032' },
];

type NewUserPayload = Omit<User, 'id' | 'status'>;

export async function findUserByEmail(email: string): Promise<User | null> {
    const db = getDb();
    if (!db) throw new Error("Firestore database is not initialized.");
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

export async function addUser(userData: NewUserPayload): Promise<{ success: boolean; message: string; newUser?: User }> {
    const db = getDb();
    if (!db) return { success: false, message: "La base de datos no está inicializada." };

    try {
        const existingUser = await findUserByEmail(userData.email);
        if (existingUser) {
            return { success: false, message: "Ya existe un usuario con este email." };
        }
        
        const userToAdd: Omit<User, 'id'> = {
          name: userData.name,
          email: userData.email,
          dni: userData.dni,
          role: userData.role,
          school: userData.school,
          status: "Pendiente",
          password: userData.password,
        };

        if (userData.grade) {
          userToAdd.grade = userData.grade;
        }
        if (userData.course) {
          userToAdd.course = userData.course;
        }

        const docRef = await addDoc(collection(db, "users"), userToAdd);
        return { success: true, message: "Usuario registrado exitosamente.", newUser: { id: docRef.id, ...userToAdd } };
    } catch (error) {
        console.error("Error adding user: ", error);
        return { success: false, message: "Ocurrió un error al registrar el usuario." };
    }
}

export async function getAllUsers(): Promise<User[]> {
    const db = getDb();
    if (!db) throw new Error("Firestore database is not initialized.");
    
    const users: User[] = [];
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });
    } catch (error) {
        console.error("Error getting all users:", error);
        throw new Error("Failed to query database for all users.");
    }
    return users;
}

export async function seedInitialUsers() {
    const db = getDb();
    if (!db) {
        console.error("Database not available for seeding.");
        throw new Error("Database not available.");
    }

    try {
        const usersCollection = collection(db, "users");
        const snapshot = await getCountFromServer(usersCollection);
        
        if (snapshot.data().count > 0) {
            return { success: true, message: "Database already contains users." };
        }

        // Now that schools/districts are also in firestore, we don't need to pass them.
        for (const user of initialUsers) {
             await addDoc(usersCollection, user);
        }
        return { success: true, message: "Database seeded successfully." };
    } catch (error) {
        console.error("Error seeding users:", error);
        throw new Error("Failed to seed database.");
    }
}

export async function updateUserStatusInDb(userId: string, newStatus: "Activo" | "Inactivo" | "Pendiente") {
    const db = getDb();
    if (!db) throw new Error("Firestore database is not initialized.");

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            status: newStatus
        });
    } catch (error) {
        console.error(`Error updating status for user ${userId}:`, error);
        throw new Error("Failed to update user status in database.");
    }
}

export async function deleteUserFromDb(userId: string) {
    const db = getDb();
    if (!db) throw new Error("Firestore database is not initialized.");

    try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw new Error("Failed to delete user from database.");
    }
}
