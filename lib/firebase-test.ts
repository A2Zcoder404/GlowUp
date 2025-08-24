import { auth, app } from './firebase';
import { connectAuthEmulator } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...');
  
  try {
    // Check if app is initialized
    if (!app) {
      console.error('❌ Firebase app not initialized');
      return false;
    }
    console.log('��� Firebase app initialized');

    // Check if auth is initialized
    if (!auth) {
      console.error('❌ Firebase auth not initialized');
      return false;
    }
    console.log('✅ Firebase auth initialized');

    // Log current auth state
    console.log('🔍 Auth state:', {
      currentUser: auth.currentUser,
      config: auth.config,
      app: auth.app.name
    });

    // Test auth connection by checking the config
    const settings = auth.settings;
    console.log('⚙️ Auth settings:', settings);

    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

export const getFirebaseConfig = () => {
  return {
    apiKey: "AIzaSyAaS9E24kYo9KBzzPG_uDcRNjdFoNfRzn0",
    authDomain: "glowup-01.firebaseapp.com",
    projectId: "glowup-01",
    storageBucket: "glowup-01.firebasestorage.app",
    messagingSenderId: "713443628588",
    appId: "1:713443628588:web:d7dd03d2e8bb9de09fa389",
    measurementId: "G-58MV5GK932"
  };
};
