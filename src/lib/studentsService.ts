
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { Student } from "./types";

type NewStudent = Omit<Student, 'id' | 'results'>;

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

const initialStudents: Omit<Student, 'id' | 'results'>[] = [
    { name: 'Juan Perez', dni: '40123456', grade: '3er Grado', course: 'A', school: 'Escuela N° 123', schoolYear: '2024' },
    { name: 'Maria Lopez', dni: '41987654', grade: '3er Grado', course: 'A', school: 'Escuela N° 123', schoolYear: '2024' },
    { name: 'Pedro Gonzalez', dni: '42345678', grade: '5to Grado', course: 'B', school: 'Escuela N° 456', schoolYear: '2024' },
    { name: 'Ana Gomez', dni: '43123456', grade: '3er Grado', course: 'A', school: 'Escuela N° 123', schoolYear: '2025' },
];

async function seedInitialStudents() {
    const db = getDb();
    const studentsCollection = collection(db, "students");
    const snapshot = await getCountFromServer(studentsCollection);
    
    if (snapshot.data().count === 0) {
        console.log("Seeding initial students...");
        for (const studentData of initialStudents) {
            await addDoc(studentsCollection, studentData);
        }
    }
}

export async function getAllStudents(): Promise<Student[]> {
    const db = getDb();
    // await seedInitialStudents(); // This was causing the issue
    const studentsCollection = collection(db, "students");
    const querySnapshot = await getDocs(studentsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export async function addStudent(studentData: NewStudent) {
    const db = getDb();
    await addDoc(collection(db, "students"), studentData);
}

export async function updateStudent(updatedStudent: Omit<Student, 'results'>) {
    const db = getDb();
    const studentRef = doc(db, "students", updatedStudent.id);
    const dataToUpdate = { ...updatedStudent };
    delete (dataToUpdate as any).id;
    await updateDoc(studentRef, dataToUpdate);
}

export async function deleteStudent(studentId: string) {
    const db = getDb();
    const studentRef = doc(db, "students", studentId);
    await deleteDoc(studentRef);
}
