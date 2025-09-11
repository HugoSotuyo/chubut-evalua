
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, Firestore } from "firebase/firestore";
import type { SystemSettings } from "./types";

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

const SETTINGS_DOC_ID = "global_settings";
const defaultSettings: SystemSettings = {
    approvalThreshold: 60,
    correctScore: 1,
    partialScore: 0.5,
    incorrectScore: 0,
    defaultScore: 10,
    scoreStep: 1,
};

export async function getSystemSettings(): Promise<SystemSettings> {
    const db = getDb();
    const settingsRef = doc(db, "systemSettings", SETTINGS_DOC_ID);
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
        // Merge with defaults to ensure all keys are present
        return { ...defaultSettings, ...docSnap.data() } as SystemSettings;
    } else {
        // If no settings exist, create them with default values
        await setDoc(settingsRef, defaultSettings);
        return defaultSettings;
    }
}

export async function updateSystemSettings(newSettings: Partial<SystemSettings>): Promise<void> {
  const db = getDb();
  const settingsRef = doc(db, "systemSettings", SETTINGS_DOC_ID);
  
  // We use set with merge: true to update or create the document
  // without overwriting fields that aren't in newSettings.
  await setDoc(settingsRef, newSettings, { merge: true });
}
