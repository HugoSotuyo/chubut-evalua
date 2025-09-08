
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, getCountFromServer, Firestore, doc, deleteDoc, query, where } from "firebase/firestore";
import type { Course } from "./types";

type NewCourse = Omit<Course, 'id'>;

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

export async function getAllCourses(): Promise<Course[]> {
    const db = getDb();
    const coursesCollection = collection(db, "courses");
    const querySnapshot = await getDocs(coursesCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

export async function addCourse(courseData: NewCourse): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    const coursesCollection = collection(db, "courses");
    const q = query(
        coursesCollection, 
        where("school", "==", courseData.school), 
        where("grade", "==", courseData.grade),
        where("section", "==", courseData.section)
    );
    const snapshot = await getCountFromServer(q);

    if (snapshot.data().count > 0) {
        return { success: false, message: `El curso ${courseData.grade} "${courseData.section}" ya existe para esta escuela.` };
    }

    await addDoc(coursesCollection, courseData);
    return { success: true, message: "Curso agregado exitosamente." };
}

export async function deleteCourse(courseId: string) {
    const db = getDb();
    const courseRef = doc(db, "courses", courseId);
    await deleteDoc(courseRef);
}
