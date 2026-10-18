
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, deleteDoc, query, where, limit } from "firebase/firestore";
import type { Result } from "./types";

type NewResult = Omit<Result, 'id'>;

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

const initialResults: Omit<Result, 'id'>[] = [
    { studentId: '1', studentName: 'Juan Perez', examId: '1', examName: 'Diagnóstico Matemática 2024', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Aprobado', score: 80, scores: {0: 8, 1: 12}, totalScore: 20, maxScore: 25, schoolYear: '2024' },
    { studentId: '2', studentName: 'Maria Lopez', examId: '1', examName: 'Diagnóstico Matemática 2024', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Desaprobado', score: 40, scores: {0: 5, 1: 5}, totalScore: 10, maxScore: 25, schoolYear: '2024'},
    { studentId: '1', studentName: 'Juan Perez', examId: '2', examName: 'Prácticas del Lenguaje - 1er Trimestre', school: 'Escuela N° 123', grade: '3er Grado', course: 'A', status: 'Aprobado', score: 100, scores: {0: 10}, totalScore: 10, maxScore: 10, schoolYear: '2024' },
];

async function seedInitialResults() {
    const db = getDb();
    const resultsCollection = collection(db, "results");
    const snapshot = await getCountFromServer(resultsCollection);
    
    if (snapshot.data().count === 0) {
        console.log("Seeding initial results...");
        for (const resultData of initialResults) {
            await addDoc(resultsCollection, resultData);
        }
    }
}

export async function getAllResults(): Promise<Result[]> {
    const db = getDb();
    // await seedInitialResults(); // This was causing the issue
    const resultsCollection = collection(db, "results");
    const querySnapshot = await getDocs(resultsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result));
}

export async function addResult(resultData: NewResult) {
  const db = getDb();
  await addDoc(collection(db, "results"), resultData);
}

export async function deleteResult(resultId: string) {
    const db = getDb();
    const resultRef = doc(db, "results", resultId);
    await deleteDoc(resultRef);
}

export async function resultExists(studentId: string, examId: string): Promise<boolean> {
    const db = getDb();
    const resultsCollection = collection(db, "results");
    const q = query(resultsCollection, where("studentId", "==", studentId), where("examId", "==", examId), limit(1));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count > 0;
}
