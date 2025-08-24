// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaS9E24kYo9KBzzPG_uDcRNjdFoNfRzn0",
  authDomain: "glowup-01.firebaseapp.com",
  projectId: "glowup-01",
  storageBucket: "glowup-01.firebasestorage.app",
  messagingSenderId: "713443628588",
  appId: "1:713443628588:web:d7dd03d2e8bb9de09fa389",
  measurementId: "G-58MV5GK932"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
export const db = getFirestore(app);

export { analytics };
export default app;
