
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import type { Exam } from "./types";

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

const initialExams: Omit<Exam, 'id'>[] = [
    { name: 'Diagnóstico Matemática 2024', tema: 'Matemática', grade: '3er Grado', created: '2024-05-10', status: 'Cerrado', questions: [{ consigna: '2+2', respuesta: '4', puntaje: 10 }, { consigna: '5*5', respuesta: '25', puntaje: 15 }] },
    { name: 'Prácticas del Lenguaje - 1er Trimestre', tema: 'Lengua', grade: '3er Grado', created: '2024-04-22', status: 'Cerrado', questions: [{ consigna: 'Capital de Argentina', respuesta: 'Buenos Aires', puntaje: 10 }] },
    { name: 'Ciencias Naturales - Seres Vivos', tema: 'Naturales', grade: '5to Grado', created: '2024-06-01', status: 'Abierto', questions: [{ consigna: 'Planeta Tierra es el...', respuesta: '3ro', puntaje: 10 }] },
];

async function seedInitialExams() {
    const db = getDb();
    const examsCollection = collection(db, "exams");
    const snapshot = await getCountFromServer(examsCollection);
    
    if (snapshot.data().count === 0) {
        console.log("Seeding initial exams...");
        for (const examData of initialExams) {
            await addDoc(examsCollection, examData);
        }
    }
}

export async function getAllExams(): Promise<Exam[]> {
    const db = getDb();
    await seedInitialExams();
    const examsCollection = collection(db, "exams");
    const querySnapshot = await getDocs(examsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
}

export async function addExam(examData: Omit<Exam, 'id' | 'status'>) {
  const db = getDb();
  const newExam = {
    ...examData,
    status: "Abierto" as const,
  };
  await addDoc(collection(db, "exams"), newExam);
}

export async function updateExam(updatedExamData: Omit<Exam, 'status'>) {
    const db = getDb();
    const examRef = doc(db, "exams", updatedExamData.id);
    const dataToUpdate = { ...updatedExamData };
    delete (dataToUpdate as any).id;
    await updateDoc(examRef, dataToUpdate);
}

export async function deleteExam(examId: string) {
    const db = getDb();
    const examRef = doc(db, "exams", examId);
    await deleteDoc(examRef);
}

export async function toggleExamStatus(examId: string) {
    const db = getDb();
    const examRef = doc(db, "exams", examId);
    const exams = await getAllExams();
    const exam = exams.find(e => e.id === examId);
    if (exam) {
        const newStatus = exam.status === "Abierto" ? "Cerrado" : "Abierto";
        await updateDoc(examRef, { status: newStatus });
    }
}
