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
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  try {
    validateAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    validateAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection');
    } else if (error.code === 'auth/configuration-not-found') {
      throw new Error('Firebase configuration error. Please contact support');
    }
    throw new Error(error.message || 'Failed to create account');
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    validateAuth();
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  try {
    validateAuth();
    return onAuthStateChanged(auth, (user: User | null) => {
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
