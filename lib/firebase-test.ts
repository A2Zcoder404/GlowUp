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

export const verifyFirebaseProject = async () => {
  console.log('🔍 Verifying Firebase project configuration...');

  const config = getFirebaseConfig();

  // Test 1: Check if Firebase project exists
  try {
    const projectUrl = `https://firebase.googleapis.com/v1beta1/projects/${config.projectId}?key=${config.apiKey}`;
    console.log('📡 Testing project existence:', projectUrl);

    const response = await fetch(projectUrl);
    console.log('📊 Project check response:', response.status, response.statusText);

    if (response.status === 403) {
      console.error('❌ API key does not have permission to access this project');
      return false;
    } else if (response.status === 404) {
      console.error('❌ Firebase project does not exist');
      return false;
    } else if (!response.ok) {
      console.error('❌ Project verification failed:', response.status);
      return false;
    }

    console.log('✅ Firebase project exists and is accessible');
  } catch (error) {
    console.error('❌ Project verification network error:', error);
    return false;
  }

  // Test 2: Check Auth domain accessibility
  try {
    const authDomainUrl = `https://${config.authDomain}`;
    console.log('🌐 Testing auth domain:', authDomainUrl);

    const response = await fetch(authDomainUrl, { mode: 'no-cors' });
    console.log('🔐 Auth domain reachable');
  } catch (error) {
    console.error('❌ Auth domain test failed:', error);
  }

  return true;
};
