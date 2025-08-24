import { db } from './firebase';
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
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Generate a simple user ID (in a real app, use proper authentication)
const getUserId = (): string => {
  let userId = localStorage.getItem('glowup-user-id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('glowup-user-id', userId);
  }
  return userId;
}

// Save user data to Firebase
export const saveUserData = async (userData: UserData): Promise<void> => {
  // Always save to localStorage as backup
  try {
    localStorage.setItem('glowup-data', JSON.stringify(userData));
  } catch (localError) {
    console.warn('localStorage save failed:', localError);
  }

  // Try Firebase only if we're in browser and have db connection
  if (typeof window !== 'undefined' && db) {
    try {
      const userId = getUserId();
      const userRef = doc(db, 'users', userId);

      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('User data saved to Firebase successfully');
    } catch (error) {
      console.warn('Firebase save failed, using localStorage backup:', error);
    }
  } else {
    console.log('Firebase not available, using localStorage only');
  }
};

// Load user data from Firebase
export const loadUserData = async (): Promise<UserData | null> => {
  // First, try to load from localStorage as it's always available
  let localData: UserData | null = null;
  try {
    const localDataStr = localStorage.getItem('glowup-data');
    if (localDataStr) {
      localData = JSON.parse(localDataStr) as UserData;
      console.log('Local data found');
    }
  } catch (localError) {
    console.warn('localStorage read failed:', localError);
  }

  // Try Firebase only if we're in browser and have db connection
  if (typeof window !== 'undefined' && db) {
    try {
      const userId = getUserId();
      const userRef = doc(db, 'users', userId);

      // Set a timeout for Firebase operations
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), 5000)
      );

      const docSnap = await Promise.race([getDoc(userRef), timeout]);

      if (docSnap && typeof docSnap.exists === 'function' && docSnap.exists()) {
        const firebaseData = docSnap.data() as UserData;
        console.log('User data loaded from Firebase');
        return firebaseData;
      } else {
        console.log('No user data found in Firebase, using local data if available');
        if (localData) {
          // Try to save local data to Firebase for future use
          try {
            await saveUserData(localData);
            console.log('Local data migrated to Firebase');
          } catch (saveError) {
            console.warn('Failed to migrate local data to Firebase:', saveError);
          }
        }
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
};

// Update specific habit progress
export const updateHabitProgress = async (habitId: string, progress: number): Promise<void> => {
  try {
    const userId = getUserId();
    const userRef = doc(db, 'users', userId);
    
    // This would require reading the current data, updating the specific habit, and saving back
    // For now, we'll handle this in the component and call saveUserData
    console.log('Habit progress update requested for:', habitId, progress);
  } catch (error) {
    console.error('Error updating habit progress:', error);
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
