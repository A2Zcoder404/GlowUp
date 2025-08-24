// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaS9E24kYo9KBzzPG_uDcRNjdFoNfRzn0",
  authDomain: "glowup-01.firebaseapp.com",
  projectId: "glowup-01",
  storageBucket: "glowup-01.firebasestorage.app",
  messagingSenderId: "713443628588",
  appId: "1:713443628588:web:d7dd03d2e8bb9de09fa389",
  measurementId: "G-58MV5GK932"
};

// Initialize Firebase only once
let app;
let db;
let auth;

if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
    } else {
      app = getApps()[0];
      console.log('Using existing Firebase app');
    }

    // Initialize Firestore
    db = getFirestore(app);
    console.log('Firestore initialized');

    // Initialize Auth
    auth = getAuth(app);
    console.log('Auth initialized');

  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.log('Not in browser environment, skipping Firebase initialization');
}

export { db, auth, app };
export default app;