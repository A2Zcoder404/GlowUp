// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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
let analytics;

if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Analytics
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.warn('Analytics initialization failed:', analyticsError);
    }

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { db, analytics, app };
export default app;
