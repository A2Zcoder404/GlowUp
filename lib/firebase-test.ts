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
    console.log('✅ Firebase app initialized');
    console.log('📱 App details:', {
      name: app.name,
      options: app.options
    });

    // Check if auth is initialized
    if (!auth) {
      console.error('❌ Firebase auth not initialized');
      return false;
    }
    console.log('✅ Firebase auth initialized');

    // Log current auth state
    console.log('🔍 Auth state:', {
      currentUser: auth.currentUser,
      app: auth.app.name
    });

    // Test Firebase project connectivity
    console.log('🌐 Testing Firebase project connectivity...');

    // Check if we can reach Firebase Auth REST API
    const testUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${app.options.apiKey}`;
    console.log('🔗 Testing URL:', testUrl);

    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123',
          returnSecureToken: true
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ API Error:', errorData);
      } else {
        console.log('✅ Firebase API is reachable');
      }
    } catch (fetchError) {
      console.error('❌ Network fetch failed:', fetchError);
    }

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
