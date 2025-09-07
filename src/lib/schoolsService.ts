
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import type { School } from "./types";

type NewSchool = Omit<School, 'id' | 'status'>;

// NOTE: This should be the same config as in other service files
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

const initialDistricts: string[] = ["Distrito I", "Distrito II", "Distrito III"];

async function seedInitialData() {
    const db = getDb();
    const schoolsCollection = collection(db, "schools");
    const districtsCollection = collection(db, "districts");

    const schoolsSnapshot = await getCountFromServer(schoolsCollection);
    if (schoolsSnapshot.data().count === 0) {
        console.log("Seeding initial schools...");
        for (const schoolData of initialSchools) {
            await addDoc(schoolsCollection, schoolData);
        }
    }

    const districtsSnapshot = await getCountFromServer(districtsCollection);
    if (districtsSnapshot.data().count === 0) {
        console.log("Seeding initial districts...");
        for (const districtName of initialDistricts) {
            await addDoc(districtsCollection, { name: districtName });
        }
    }
}

export async function getAllSchools(): Promise<School[]> {
    const db = getDb();
    await seedInitialData(); // Seed if needed
    const schoolsCollection = collection(db, "schools");
    const querySnapshot = await getDocs(schoolsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
}

export async function getAllDistricts(): Promise<string[]> {
    const db = getDb();
    await seedInitialData(); // Seed if needed
    const districtsCollection = collection(db, "districts");
    const querySnapshot = await getDocs(districtsCollection);
    return querySnapshot.docs.map(doc => doc.data().name as string).sort();
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
    const schools = await getAllSchools(); // Inefficient, but simple.
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
