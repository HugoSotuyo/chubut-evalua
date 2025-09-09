

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import type { School, District } from "./types";

type NewSchool = Omit<School, 'id' | 'status'>;

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

const initialSchools: Omit<School, 'id'>[] = [
    { name: "Escuela N° 123", district: "Distrito I", status: "Activa" },
    { name: "Escuela N° 456", district: "Distrito II", status: "Activa" },
    { name: "Escuela N° 789", district: "Distrito I", status: "Inactiva" },
];

const initialDistricts: string[] = ["Distrito I", "Distrito II", "Distrito III", "Distrito IV", "Distrito V"];

async function seedCollection(collectionName: string, initialData: any[], checkField: string) {
    const db = getDb();
    const collectionRef = collection(db, collectionName);
    const snapshot = await getCountFromServer(collectionRef);
    if (snapshot.data().count === 0) {
        console.log(`Seeding initial ${collectionName}...`);
        for (const item of initialData) {
            // Check if item already exists to prevent duplicates on concurrent calls
            const q = query(collectionRef, where(checkField, "==", item[checkField]));
            const existsSnap = await getDocs(q);
            if (existsSnap.empty) {
                await addDoc(collectionRef, item);
            }
        }
    }
}


export async function getAllSchools(): Promise<School[]> {
    const db = getDb();
    await seedCollection("schools", initialSchools.map(s => ({...s})), "name");
    const schoolsCollection = collection(db, "schools");
    const querySnapshot = await getDocs(schoolsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
}

export async function getAllDistricts(): Promise<District[]> {
    const db = getDb();
    await seedCollection("districts", initialDistricts.map(name => ({name})), "name");
    const districtsCollection = collection(db, "districts");
    const querySnapshot = await getDocs(districtsCollection);
    const districts = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as District));
    return districts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addSchool(schoolData: NewSchool) {
    const db = getDb();
    const newSchool = {
        ...schoolData,
        status: "Activa" as const,
    };
    await addDoc(collection(db, "schools"), newSchool);
}

export async function updateSchool(updatedSchool: School) {
    const db = getDb();
    const schoolRef = doc(db, "schools", updatedSchool.id);
    const dataToUpdate = { ...updatedSchool };
    delete (dataToUpdate as any).id;
    await updateDoc(schoolRef, dataToUpdate);
}

export async function deleteSchool(schoolId: string) {
    const db = getDb();
    const schoolRef = doc(db, "schools", schoolId);
    await deleteDoc(schoolRef);
}

export async function toggleSchoolStatus(schoolId: string) {
    const db = getDb();
    const schoolRef = doc(db, "schools", schoolId);
    const schools = await getAllSchools();
    const school = schools.find(s => s.id === schoolId);
    if (school) {
        const newStatus = school.status === "Activa" ? "Inactiva" : "Activa";
        await updateDoc(schoolRef, { status: newStatus });
    }
}

export async function addDistrict(districtName: string): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    const districtsCollection = collection(db, "districts");
    const q = query(districtsCollection, where("name", "==", districtName));
    const snapshot = await getCountFromServer(q);

    if (snapshot.data().count > 0) {
        return { success: false, message: `El distrito "${districtName}" ya existe.` };
    }

    await addDoc(districtsCollection, { name: districtName });
    return { success: true, message: `El distrito "${districtName}" ha sido agregado.` };
}

export async function deleteDistrict(districtId: string): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    const districtDocRef = doc(db, "districts", districtId);
    
    // First, find the district name
    const districts = await getAllDistricts();
    const districtToDelete = districts.find(d => d.id === districtId);
    if (!districtToDelete) {
        return { success: false, message: "No se encontró el distrito para eliminar." };
    }
    const districtName = districtToDelete.name;

    // Check if any school is using this district
    const schoolsCollection = collection(db, "schools");
    const q = query(schoolsCollection, where("district", "==", districtName), limit(1));
    const schoolSnapshot = await getDocs(q);

    if (!schoolSnapshot.empty) {
        const schoolName = schoolSnapshot.docs[0].data().name;
        return { success: false, message: `No se puede eliminar. El distrito está en uso por la escuela: ${schoolName} (y posiblemente otras).` };
    }

    // If no schools are using it, delete the district
    await deleteDoc(districtDocRef);
    return { success: true, message: `El distrito "${districtName}" ha sido eliminado.` };
}
