

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc, query, where, limit } from "firebase/firestore";
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

const initialSchools: Omit<School, 'id' | 'districtId'>[] = [
    { name: "Escuela N° 123", district: "Distrito I", status: "Activa" },
    { name: "Escuela N° 456", district: "Distrito II", status: "Activa" },
    { name: "Escuela N° 789", district: "Distrito I", status: "Inactiva" },
];

const initialDistricts: string[] = ["Distrito I", "Distrito II", "Distrito III", "Distrito IV", "Distrito V"];

async function seedInitialData() {
    const db = getDb();
    const schoolsCollection = collection(db, "schools");
    const districtsCollection = collection(db, "districts");

    const districtsSnapshot = await getCountFromServer(districtsCollection);
    if (districtsSnapshot.data().count === 0) {
        console.log("Seeding initial districts...");
        const districtPromises = initialDistricts.map(name => addDoc(districtsCollection, { name }));
        await Promise.all(districtPromises);
    }
    
    // We need to get the districts with their IDs to associate them with schools
    const allDistricts = await getAllDistricts();

    const schoolsSnapshot = await getCountFromServer(schoolsCollection);
    if (schoolsSnapshot.data().count === 0) {
        console.log("Seeding initial schools...");
        const schoolPromises = initialSchools.map(school => {
            const district = allDistricts.find(d => d.name === school.district);
            const schoolData = {
                ...school,
                districtId: district ? district.id : null
            };
            return addDoc(schoolsCollection, schoolData);
        });
        await Promise.all(schoolPromises);
    }
}


export async function getAllSchools(): Promise<School[]> {
    const db = getDb();
    await seedInitialData();
    const schoolsCollection = collection(db, "schools");
    const querySnapshot = await getDocs(schoolsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
}

export async function getAllDistricts(): Promise<District[]> {
    const db = getDb();
    await seedInitialData();
    const districtsCollection = collection(db, "districts");
    const querySnapshot = await getDocs(districtsCollection);
    const districts = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as District));
    return districts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addSchool(schoolData: Omit<NewSchool, 'districtId'>, districtId: string) {
    const db = getDb();
    const newSchool = {
        ...schoolData,
        districtId: districtId,
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
    
    const allDistricts = await getAllDistricts();
    const districtToDelete = allDistricts.find(d => d.id === districtId);
    if (!districtToDelete) {
        return { success: false, message: "No se encontró el distrito para eliminar." };
    }

    // Check if any school is using this district ID
    const schoolsCollection = collection(db, "schools");
    const q = query(schoolsCollection, where("districtId", "==", districtId), limit(1));
    const schoolSnapshot = await getDocs(q);

    if (!schoolSnapshot.empty) {
        const schoolName = schoolSnapshot.docs[0].data().name;
        return { success: false, message: `No se puede eliminar. El distrito está en uso por la escuela: ${schoolName} (y posiblemente otras).` };
    }

    await deleteDoc(districtDocRef);
    return { success: true, message: `El distrito "${districtToDelete.name}" ha sido eliminado.` };
}
