

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { User } from "./types";

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

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
    { name: 'Laura Martinez', email: 'laura.martinez@chubut.edu.ar', dni: '30123456', role: 'Docente', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Activo', password: '123', schoolYear: '2024' },
    { name: 'Carlos Gomez', email: 'carlos.gomez@chubut.edu.ar', dni: '25123456', role: 'Director', school: 'Escuela N° 456', status: 'Activo', password: '123', schoolYear: '2024' },
    { name: 'Ana Fernandez', email: 'ana.fernandez@chubut.edu.ar', dni: '28123456', role: 'Referente', school: 'Región I', status: 'Activo', password: '123' },
    { name: 'Admin General', email: 'admin@chubut.edu.ar', dni: '20123456', role: 'Administrador', school: 'Ministerio', status: 'Activo', password: '123' },
    { name: 'Usuario Pendiente', email: 'pendiente@chubut.edu.ar', dni: '35123456', role: 'Docente', school: 'Escuela N° 789', status: 'Pendiente', password: '123', schoolYear: '2024' },
    { name: 'Evaluador General', email: 'evaluador@chubut.edu.ar', dni: '1', role: 'Evaluador', school: 'Sistema', status: 'Activo', password: 'hdsp6032' },
];

type NewUserPayload = Omit<User, 'id' | 'status'>;

export async function findUserByEmailAndYear(email: string, schoolYear: string): Promise<User | null> {
    const db = getDb();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email), where("schoolYear", "==", schoolYear));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error) {
        console.error("Error finding user by email and year:", error);
        throw error;
    }
}


export async function findUserByEmail(email: string): Promise<User | null> {
    const db = getDb();
    const usersRef = collection(db, "users");
    // This query now might return multiple users if they are in different school years.
    // For login, we might need a more sophisticated approach, but for now, we'll find the first active one.
    const q = query(usersRef, where("email", "==", email));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        
        // Prefer returning an active user if multiple exist
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return users.find(u => u.status === "Activo") || users[0];

    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

export async function addUser(userData: NewUserPayload): Promise<{ success: boolean; message: string; newUser?: User }> {
    const db = getDb();
    if (!db) return { success: false, message: "La base de datos no está inicializada." };

    try {
        if (userData.schoolYear) {
            const existingUserInYear = await findUserByEmailAndYear(userData.email, userData.schoolYear);
            if (existingUserInYear) {
                return { success: false, message: "Ya existe un usuario con este email para el ciclo lectivo actual." };
            }
        } else {
             // For roles without a school year, check if email exists at all.
            const existingUser = await findUserByEmail(userData.email);
            if (existingUser) {
                return { success: false, message: "Ya existe un usuario con este email." };
            }
        }
        
        const userToAdd: Omit<User, 'id'> = {
          name: userData.name,
          email: userData.email,
          dni: userData.dni,
          role: userData.role,
          school: userData.school,
          status: "Pendiente",
          password: userData.password,
          schoolYear: userData.schoolYear
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
    await seedInitialUsers();
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
    const usersCollection = collection(db, "users");
    const snapshot = await getCountFromServer(usersCollection);
    
    if (snapshot.data().count === 0) {
        console.log("Seeding initial users...");
        for (const user of initialUsers) {
             await addDoc(usersCollection, user);
        }
    }
}

export async function updateUserStatusInDb(userId: string, newStatus: "Activo" | "Inactivo" | "Pendiente") {
    const db = getDb();
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

export async function updateUserInDb(user: User) {
    const db = getDb();
    try {
        const userRef = doc(db, "users", user.id);
        const userData = { ...user };
        // Don't save the id within the document itself
        delete userData.id; 
        await updateDoc(userRef, userData);
    } catch (error) {
        console.error(`Error updating user ${user.id}:`, error);
        throw new Error("Failed to update user in database.");
    }
}

export async function updateUserPasswordInDb(userId: string, newPassword: string) {
    const db = getDb();
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            password: newPassword
        });
    } catch (error) {
        console.error(`Error updating password for user ${userId}:`, error);
        throw new Error("Failed to update user password in database.");
    }
}


export async function deleteUserFromDb(userId: string) {
    const db = getDb();
    try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw new Error("Failed to delete user from database.");
    }
}
