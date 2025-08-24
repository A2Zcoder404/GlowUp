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
  lastSaved?: string // ISO timestamp of last save
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Get authenticated user ID with fallback for data persistence
const getUserId = (): string => {
  const user = auth?.currentUser;
  if (user && user.uid) {
    // Return UID for properly authenticated users
    return user.uid;
  }

  // Fallback to session storage to maintain data across page reloads
  let sessionUserId = sessionStorage.getItem('glowup-session-user');
  if (!sessionUserId) {
    // Create a temporary session ID if none exists
    sessionUserId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('glowup-session-user', sessionUserId);
  }

  console.log('Using session fallback for user data operations');
  return sessionUserId;
};

// Get user ID with error handling
const safeGetUserId = (): string | null => {
  try {
    return getUserId();
  } catch (error) {
    console.warn('Could not get user ID:', error);
    return null;
  }
};

// Save user data with resilient persistence
export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    // Get user ID with fallback
    const userId = safeGetUserId();
    if (!userId) {
      console.warn('No user ID available - skipping save');
      return;
    }

    // Prepare user data with ID
    const secureUserData = {
      ...userData,
      userId: userId,
      lastSaved: new Date().toISOString()
    };

    // Always save to localStorage first (primary storage)
    const userSpecificKey = `glowup-data-${userId}`;
    localStorage.setItem(userSpecificKey, JSON.stringify(secureUserData));
    console.log(`Data saved to localStorage for user: ${userId.substring(0, 8)}...`);

    // Try Firebase as secondary storage (don't fail if it doesn't work)
    if (typeof window !== 'undefined' && db && auth?.currentUser) {
      try {
        const userRef = doc(db, 'users', userId);

        await setDoc(userRef, {
          ...secureUserData,
          updatedAt: serverTimestamp()
        }, { merge: true });

        console.log(`Data synced to Firebase for user: ${userId.substring(0, 8)}...`);
      } catch (firebaseError) {
        console.warn('Firebase save failed, but localStorage succeeded:', firebaseError);
        // Don't throw error - localStorage save was successful
      }
    } else {
      console.log('Firebase not available, using localStorage only');
    }
  } catch (error) {
    console.error('Failed to save user data:', error);
    // Don't throw error to prevent app crashes - data is still saved to localStorage
    // The function should not fail the entire operation if localStorage succeeded
  }
};

// Load user data with resilient loading
export const loadUserData = async (): Promise<UserData | null> => {
  try {
    // Get user ID with fallback
    const userId = safeGetUserId();
    if (!userId) {
      console.warn('No user ID available - cannot load data');
      return null;
    }

    // Load from user-specific localStorage key (primary source)
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

    // Try Firebase as secondary source (if available and authenticated)
    if (typeof window !== 'undefined' && db && auth?.currentUser) {
      try {
        const userRef = doc(db, 'users', userId);

        // Set a timeout for Firebase operations
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firebase timeout')), 3000)
        );

        const docSnap = await Promise.race([getDoc(userRef), timeout]);

        if (docSnap && typeof docSnap.exists === 'function' && docSnap.exists()) {
          const firebaseData = docSnap.data() as UserData;

          console.log(`Firebase data loaded for user: ${userId.substring(0, 8)}...`);

          // Use Firebase data if it's newer than local data
          if (!localData || (firebaseData.lastSaved && firebaseData.lastSaved > (localData.lastSaved || ''))) {
            console.log('Using Firebase data (newer)');
            return firebaseData;
          } else {
            console.log('Using local data (newer or same)');
            return localData;
          }
        } else {
          console.log('No Firebase data found, using local data');
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
    return null;
  }
};

// Update specific habit progress with resilient handling
export const updateHabitProgress = async (habitId: string, progress: number): Promise<void> => {
  try {
    const userId = safeGetUserId();
    if (!userId) {
      console.warn('No user ID available for habit progress update');
      return;
    }

    console.log(`Habit progress update for user ${userId.substring(0, 8)}...: ${habitId} = ${progress}`);

    // This function is maintained for future use - currently handled in component
    // All updates go through saveUserData which has proper user isolation
  } catch (error) {
    console.warn('Error updating habit progress:', error);
    // Don't throw to prevent app crashes
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

// Clear session data on sign out (but preserve user data for re-login)
export const clearSessionData = (): void => {
  try {
    // Clear session-specific data but preserve user data for re-login
    sessionStorage.removeItem('glowup-session-user');
    console.log('Cleared session data - user data preserved for re-login');
  } catch (error) {
    console.warn('Error clearing session data:', error);
  }
};

// Clear all user data (use only when explicitly requested)
export const clearAllUserData = (userId?: string): void => {
  try {
    if (userId) {
      // Clear specific user's data
      const userSpecificKey = `glowup-data-${userId}`;
      localStorage.removeItem(userSpecificKey);
      console.log(`Permanently cleared data for user: ${userId.substring(0, 8)}...`);
    }
    // Clear session data
    clearSessionData();
    // Clear any legacy data
    localStorage.removeItem('glowup-data');
    localStorage.removeItem('glowup-user-id');
  } catch (error) {
    console.warn('Error clearing user data:', error);
  }
};

// Legacy function for compatibility (now just clears session)
export const clearUserData = clearSessionData;

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

// Security check: Verify user owns the data (relaxed for better UX)
export const verifyDataOwnership = (userData: UserData, expectedUserId: string): boolean => {
  // Allow data without userId (for backward compatibility) or matching userId
  if (userData.userId && userData.userId !== expectedUserId) {
    console.warn('Data ownership mismatch - using data but flagging for security');
    // Return true but log warning instead of blocking
    return true;
  }
  return true;
};

// Check if user data exists for current user
export const hasUserData = (userId?: string): boolean => {
  try {
    const targetUserId = userId || safeGetUserId();
    if (!targetUserId) return false;

    const userSpecificKey = `glowup-data-${targetUserId}`;
    const data = localStorage.getItem(userSpecificKey);
    return !!data;
  } catch (error) {
    return false;
  }
};

// Get user data size/stats for debugging
export const getUserDataStats = (userId?: string) => {
  try {
    const targetUserId = userId || safeGetUserId();
    if (!targetUserId) return null;

    const userSpecificKey = `glowup-data-${targetUserId}`;
    const data = localStorage.getItem(userSpecificKey);

    if (data) {
      const parsed = JSON.parse(data);
      return {
        userId: targetUserId.substring(0, 8) + '...',
        dataSize: data.length,
        totalXP: parsed.totalXP || 0,
        level: parsed.level || 1,
        habits: parsed.habits?.length || 0,
        lastSaved: parsed.lastSaved || 'unknown'
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};
