import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Validate auth instance
const validateAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  return auth;
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const authInstance = validateAuth();
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection');
    }
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const authInstance = validateAuth();

    console.log('🚀 Attempting sign up for:', email);
    console.log('🔧 Auth config:', {
      apiKey: authInstance.app.options.apiKey?.substring(0, 10) + '...',
      authDomain: authInstance.app.options.authDomain,
      projectId: authInstance.app.options.projectId
    });

    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);

    console.log('✅ Sign up successful');
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName
    };
  } catch (error: any) {
    console.error('❌ Sign up error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      authDomain: auth?.app?.options?.authDomain,
      projectId: auth?.app?.options?.projectId,
      apiKey: auth?.app?.options?.apiKey?.substring(0, 10) + '...'
    });

    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/network-request-failed') {
      console.error('🌐 Network request failed - possible causes:');
      console.error('1. Internet connectivity issues');
      console.error('2. Firebase project configuration problems');
      console.error('3. API key restrictions or invalid key');
      console.error('4. Domain not authorized in Firebase Console');
      console.error('5. Firebase project does not exist or is disabled');

      throw new Error('Network error: Unable to connect to Firebase. This might be due to project configuration issues or network connectivity. Check the browser console for details.');
    } else if (error.code === 'auth/configuration-not-found') {
      throw new Error('Firebase configuration error. The project may not be properly set up.');
    } else if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Invalid Firebase API key. Please check your project configuration.');
    } else if (error.code === 'auth/project-not-found') {
      throw new Error('Firebase project not found. Please verify your project ID.');
    }

    throw new Error(`Authentication failed: ${error.message || 'Unknown error'}`);
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    const authInstance = validateAuth();
    await signOut(authInstance);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  try {
    const authInstance = validateAuth();
    return onAuthStateChanged(authInstance, (user: User | null) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Auth state listener error:', error);
    return () => {}; // Return empty unsubscribe function
  }
};
