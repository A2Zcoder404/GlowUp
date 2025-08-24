// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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

// Initialize Firebase app
let app;
let analytics;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase app initialization failed:', error);
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase services
let db;
let auth;

if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  try {
    // Initialize Auth
    auth = getAuth(app);

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Analytics (only in browser)
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.warn('Analytics initialization failed:', analyticsError);
    }

    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Firebase services initialization failed:', error);
  }
} else {
  console.log('Not in browser environment, skipping Firebase initialization');
}

export { db, auth, app };
export default app;
