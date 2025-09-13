
"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, Firestore, doc, deleteDoc } from "firebase/firestore";

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


export async function migrateData(): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    const batch = writeBatch(db);
    let changesCount = 0;

    try {
        // 1. Rename 'districts' collection to 'regions'
        const districtsSnapshot = await getDocs(collection(db, "districts"));
        if (!districtsSnapshot.empty) {
            districtsSnapshot.forEach(districtDoc => {
                const districtData = districtDoc.data();
                const newRegionRef = doc(db, "regions", districtDoc.id);
                batch.set(newRegionRef, districtData);
                batch.delete(districtDoc.ref);
                changesCount++;
            });
        }
        
        // 2. Update 'school' field in 'users' collection
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            if (userData.school && typeof userData.school === 'string' && userData.school.includes('Distrito')) {
                const newSchoolValue = userData.school.replace(/Distrito/g, 'Región');
                batch.update(userDoc.ref, { school: newSchoolValue });
                changesCount++;
            }
        });

        // 3. Update 'region' field in 'schools' collection
        const schoolsSnapshot = await getDocs(collection(db, "schools"));
        schoolsSnapshot.forEach(schoolDoc => {
            const schoolData = schoolDoc.data();
            if (schoolData.region && typeof schoolData.region === 'string' && schoolData.region.includes('Distrito')) {
                const newRegionValue = schoolData.region.replace(/Distrito/g, 'Región');
                batch.update(schoolDoc.ref, { region: newRegionValue });
                changesCount++;
            }
        });

        if (changesCount > 0) {
            await batch.commit();
            return { success: true, message: `Migración completada. Se actualizaron ${changesCount} registros.` };
        } else {
            return { success: true, message: "No se encontraron datos para migrar. El sistema ya está actualizado." };
        }

    } catch (error) {
        console.error("Error durante la migración de datos:", error);
        throw new Error("La migración falló. Revisa la consola para más detalles.");
    }
}
