

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc, query, where, limit } from "firebase/firestore";
import type { School, Region } from "./types";

type NewSchool = Omit<School, 'id' | 'status' | 'regionId'>;

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

const initialSchools: Omit<School, 'id' | 'regionId'>[] = [
    { name: "Escuela N° 123", region: "Región I", status: "Activa" },
    { name: "Escuela N° 456", region: "Región II", status: "Activa" },
    { name: "Escuela N° 789", region: "Región I", status: "Inactiva" },
];

const initialRegions: string[] = ["Región I", "Región II", "Región III", "Región IV", "Región V"];

async function seedInitialData() {
    const db = getDb();
    const regionsCollection = collection(db, "regions");
    const regionsSnapshot = await getCountFromServer(regionsCollection);
    
    if (regionsSnapshot.data().count === 0) {
        console.log("Seeding initial regions...");
        const regionPromises = initialRegions.map(name => addDoc(regionsCollection, { name }));
        await Promise.all(regionPromises);
        
        // Now seed schools
        const schoolsCollection = collection(db, "schools");
        const schoolsSnapshot = await getCountFromServer(schoolsCollection);
        if (schoolsSnapshot.data().count === 0) {
            console.log("Seeding initial schools...");
            // We need the full region objects to get their IDs
            const allRegions = await getDocs(regionsCollection).then(snap => snap.docs.map(d => ({id: d.id, ...d.data()} as Region)));
            const schoolPromises = initialSchools.map(school => {
                const region = allRegions.find(d => d.name === school.region);
                const schoolData = {
                    name: school.name,
                    region: school.region,
                    status: school.status,
                    regionId: region ? region.id : null
                };
                return addDoc(schoolsCollection, schoolData);
            });
            await Promise.all(schoolPromises);
        }
    }
}


export async function getAllSchools(): Promise<School[]> {
    const db = getDb();
    // await seedInitialData(); // This was causing the issue
    const schoolsCollection = collection(db, "schools");
    const querySnapshot = await getDocs(schoolsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
}

export async function getAllRegions(): Promise<Region[]> {
    const db = getDb();
    // await seedInitialData(); // This was causing the issue
    const regionsCollection = collection(db, "regions");
    const querySnapshot = await getDocs(regionsCollection);
    const regions = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Region));
    return regions.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addSchool(schoolData: Omit<NewSchool, 'regionId'>, regionId: string) {
    const db = getDb();
    const newSchool = {
        ...schoolData,
        regionId: regionId,
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

export async function addRegion(regionName: string): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    const regionsCollection = collection(db, "regions");
    const q = query(regionsCollection, where("name", "==", regionName));
    const snapshot = await getCountFromServer(q);

    if (snapshot.data().count > 0) {
        return { success: false, message: `La región "${regionName}" ya existe.` };
    }

    await addDoc(regionsCollection, { name: regionName });
    return { success: true, message: `La región "${regionName}" ha sido agregada.` };
}

export async function deleteRegion(regionId: string): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    const regionDocRef = doc(db, "regions", regionId);
    
    const allRegions = await getAllRegions();
    const regionToDelete = allRegions.find(d => d.id === regionId);
    if (!regionToDelete) {
        return { success: false, message: "No se encontró la región para eliminar." };
    }

    // Check if any school is using this region ID
    const schoolsCollection = collection(db, "schools");
    const q = query(schoolsCollection, where("regionId", "==", regionId), limit(1));
    const schoolSnapshot = await getDocs(q);

    if (!schoolSnapshot.empty) {
        const schoolName = schoolSnapshot.docs[0].data().name;
        return { success: false, message: `No se puede eliminar. La región está en uso por la escuela: ${schoolName} (y posiblemente otras).` };
    }

    await deleteDoc(regionDocRef);
    return { success: true, message: `La región "${regionToDelete.name}" ha sido eliminada.` };
}
