import { db } from './firebase';
import { auth } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface Habit {
  id: string
  name: string
  type: 'water' | 'exercise' | 'meditation' | 'reading'
  target: number
  targetUnit: string
  progress: number
  progressUnit: string
  streakCount: number
  completedToday: boolean
  xpEarned: number
  icon: string
  lastCompletedDate?: string
}

export interface Badge {
  id: string
  name: string
  icon: string
  unlocked: boolean
  unlockedDate?: string
}

export interface UserData {
  habits: Habit[]
  totalXP: number
  level: number
  badges: Badge[]
  lastVisitDate: string
  userId?: string // User ID for data ownership verification
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Get authenticated user ID with security checks
const getUserId = (): string | null => {
  const user = auth?.currentUser;
  if (user && user.uid) {
    // Only return UID for properly authenticated users
    return user.uid;
  }

  // Return null if no authenticated user - no fallback to prevent data mixing
  console.warn('No authenticated user found - user data operations will be blocked');
  return null;
};

// Validate user is authenticated before any data operations
const validateUserAuthentication = (): string => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User must be authenticated to access data');
  }
  return userId;
};

// Save user data to Firebase (authenticated users only)
export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    // Validate user is authenticated
    const userId = validateUserAuthentication();

    // Security check: Ensure data belongs to current user
    if (userData.userId && userData.userId !== userId) {
      console.error('Data ownership violation in save operation');
      throw new Error('Cannot save data for different user');
    }

    // Prepare secure user data
    const secureUserData = {
      ...userData,
      userId: userId // Always set to current user for security
    };

    // Save to user-specific localStorage key
    const userSpecificKey = `glowup-data-${userId}`;
    localStorage.setItem(userSpecificKey, JSON.stringify(secureUserData));

    // Save to Firebase with user isolation
    if (typeof window !== 'undefined' && db) {
      const userRef = doc(db, 'users', userId);

      await setDoc(userRef, {
        ...secureUserData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log(`User data saved securely for user: ${userId.substring(0, 8)}...`);
    }
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

// Load user data from Firebase (authenticated users only)
export const loadUserData = async (): Promise<UserData | null> => {
  try {
    // Validate user is authenticated
    const userId = validateUserAuthentication();

    // Load from user-specific localStorage key
    const userSpecificKey = `glowup-data-${userId}`;
    let localData: UserData | null = null;
    try {
      const localDataStr = localStorage.getItem(userSpecificKey);
      if (localDataStr) {
        localData = JSON.parse(localDataStr) as UserData;
        console.log(`Local data found for user: ${userId.substring(0, 8)}...`);
      }
    } catch (localError) {
      console.warn('localStorage read failed:', localError);
    }

    // Try Firebase with user isolation
    if (typeof window !== 'undefined' && db) {
      try {
        const userRef = doc(db, 'users', userId);

        // Set a timeout for Firebase operations
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase timeout')), 5000)
        );

        const docSnap = await Promise.race([getDoc(userRef), timeout]);

        if (docSnap && typeof docSnap.exists === 'function' && docSnap.exists()) {
          const firebaseData = docSnap.data() as UserData;

          // Verify the data belongs to the current user
          if (firebaseData.userId && firebaseData.userId !== userId) {
            console.error('Data integrity violation - user ID mismatch');
            throw new Error('Unauthorized data access attempt');
          }

          console.log(`User data loaded from Firebase for user: ${userId.substring(0, 8)}...`);
          return firebaseData;
        } else {
          console.log('No user data found in Firebase, using local data if available');
          return localData;
        }
      } catch (error) {
        console.warn('Firebase load failed, using localStorage:', error);
        return localData;
      }
    } else {
      console.log('Firebase not available, using localStorage only');
      return localData;
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
    // Return null instead of any cached data to prevent unauthorized access
    return null;
  }
};

// Update specific habit progress (authenticated users only)
export const updateHabitProgress = async (habitId: string, progress: number): Promise<void> => {
  try {
    // Validate user is authenticated
    const userId = validateUserAuthentication();

    console.log(`Habit progress update for user ${userId.substring(0, 8)}...: ${habitId} = ${progress}`);

    // This function is maintained for future use - currently handled in component
    // All updates go through saveUserData which has proper user isolation
  } catch (error) {
    console.error('Error updating habit progress:', error);
    throw error;
  }
};

// Check if it's a new day and reset daily progress
export const checkAndResetDailyProgress = (userData: UserData): UserData => {
  const today = new Date().toDateString();
  
  if (userData.lastVisitDate !== today) {
    console.log('New day detected, resetting daily progress');
    
    const resetHabits = userData.habits.map(habit => {
      const targetMet = (habit.progress || 0) >= (habit.target || 1);
      
      return {
        ...habit,
        progress: 0, // Reset daily progress
        completedToday: false,
        // If user didn't meet target yesterday, reset streak
        streakCount: targetMet && habit.lastCompletedDate === userData.lastVisitDate 
          ? (habit.streakCount || 0) 
          : 0
      };
    });
    
    return {
      ...userData,
      habits: resetHabits,
      lastVisitDate: today
    };
  }
  
  return userData;
};

// Initialize default habits
export const getInitialHabits = (): Habit[] => [
  {
    id: '1',
    name: 'Drink Water',
    type: 'water',
    target: 3,
    targetUnit: 'L',
    progress: 0,
    progressUnit: 'L',
    streakCount: 0,
    completedToday: false,
    xpEarned: 0,
    icon: '💧'
  },
  {
    id: '2',
    name: 'Exercise',
    type: 'exercise',
    target: 60,
    targetUnit: 'min',
    progress: 0,
    progressUnit: 'min',
    streakCount: 0,
    completedToday: false,
    xpEarned: 0,
    icon: '🏃‍♂️'
  },
  {
    id: '3',
    name: 'Meditate',
    type: 'meditation',
    target: 30,
    targetUnit: 'min',
    progress: 0,
    progressUnit: 'min',
    streakCount: 0,
    completedToday: false,
    xpEarned: 0,
    icon: '🧘‍♀️'
  },
  {
    id: '4',
    name: 'Read',
    type: 'reading',
    target: 60,
    targetUnit: 'min',
    progress: 0,
    progressUnit: 'min',
    streakCount: 0,
    completedToday: false,
    xpEarned: 0,
    icon: '📚'
  },
];

// Initialize default badges
export const getInitialBadges = (): Badge[] => [
  {
    id: 'hydration-hero',
    name: 'Hydration Hero',
    icon: '💧',
    unlocked: false
  },
  {
    id: 'fitness-warrior',
    name: 'Fitness Warrior',
    icon: '🏃‍♂️',
    unlocked: false
  },
  {
    id: 'mindful-master',
    name: 'Mindful Master',
    icon: '🧘‍♀️',
    unlocked: false
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    icon: '📚',
    unlocked: false
  },
  {
    id: 'wellness-champion',
    name: 'Wellness Champion',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'consistency-master',
    name: 'Consistency Master',
    icon: '👑',
    unlocked: false
  }
];

// Clear user-specific data on sign out (security measure)
export const clearUserData = (userId?: string): void => {
  try {
    if (userId) {
      // Clear specific user's data
      const userSpecificKey = `glowup-data-${userId}`;
      localStorage.removeItem(userSpecificKey);
      console.log(`Cleared data for user: ${userId.substring(0, 8)}...`);
    } else {
      // Clear any old non-user-specific data (legacy cleanup)
      localStorage.removeItem('glowup-data');
      localStorage.removeItem('glowup-user-id');
      console.log('Cleared legacy localStorage data');
    }
  } catch (error) {
    console.warn('Error clearing user data:', error);
  }
};

// Get current authenticated user info (safe exposure)
export const getCurrentUserInfo = () => {
  const user = auth?.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAuthenticated: true
    };
  }
  return {
    uid: null,
    email: null,
    displayName: null,
    isAuthenticated: false
  };
};

// Security check: Verify user owns the data
export const verifyDataOwnership = (userData: UserData, expectedUserId: string): boolean => {
  if (userData.userId && userData.userId !== expectedUserId) {
    console.error('Data ownership verification failed');
    return false;
  }
  return true;
};
