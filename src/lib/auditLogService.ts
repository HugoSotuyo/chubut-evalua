
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, Firestore, query, orderBy } from "firebase/firestore";
import type { AuditLog } from "./types";

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

export async function getAllAuditLogs(): Promise<AuditLog[]> {
    const db = getDb();
    const logsCollection = collection(db, "auditLogs");
    const q = query(logsCollection, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
}

export async function addAuditLog(logData: Omit<AuditLog, 'id'>): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, "auditLogs"), logData);
}
