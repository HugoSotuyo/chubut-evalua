
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "chubut-evala",
  appId: "1:674743382515:web:a8f412636610abb7f86286",
  storageBucket: "chubut-evala.firebasestorage.app",
  apiKey: "AIzaSyDj8HnZQ88Vni_bNZuXcGkUVm16ePKsQlI",
  authDomain: "chubut-evala.firebaseapp.com",
  messagingSenderId: "674743382515",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
