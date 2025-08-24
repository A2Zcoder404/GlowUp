'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChange, logOut, type AuthUser } from '../lib/auth'
import LoginPage from '../components/LoginPage'
import SettingsModal from '../components/SettingsModal'
import {
  saveUserData,
  loadUserData,
  checkAndResetDailyProgress,
  getInitialHabits,
  getInitialBadges,
  type UserData,
  type Habit,
  type Badge
} from '../lib/database'

// Badge condition functions (not stored in Firebase)
const badgeConditions: Record<string, (habits: Habit[]) => boolean> = {
  'hydration-hero': (habits: Habit[]) => habits.find(h => h.type === 'water' && h.streakCount >= 7) !== undefined,
  'fitness-warrior': (habits: Habit[]) => habits.find(h => h.type === 'exercise' && h.streakCount >= 7) !== undefined,
  'mindful-master': (habits: Habit[]) => habits.find(h => h.type === 'meditation' && h.streakCount >= 7) !== undefined,
  'knowledge-seeker': (habits: Habit[]) => habits.find(h => h.type === 'reading' && h.streakCount >= 7) !== undefined,
  'wellness-champion': (habits: Habit[]) => habits.every(h => h.streakCount >= 30),
  'consistency-master': (habits: Habit[]) => habits.filter(h => h.streakCount >= 14).length >= 3,
}

const motivationalQuotes = [
  "Progress, not perfection! 🌟",
  "Every small step counts! 💫",
  "You're building something amazing! ✨",
  "Consistency is your superpower! 🚀",
  "Today's effort is tomorrow's strength! 💪",
  "Small daily improvements lead to stunning results! 🎯",
  "Your wellness journey is unique and beautiful! 🌸",
  "Every habit completed is a victory! 🏆",
  "Believe in the power of your daily choices! ⭐",
  "You're stronger than you think! 💪",
  "Mindful moments create magical transformations! 🧘‍♀️",
  "Your health is your greatest wealth! 💎",
  "Celebrate every small win today! 🎉",
  "Consistency beats perfection every time! 🔥",
  "You're writing your wellness story daily! 📖"
]


const getTodayKey = () => new Date().toDateString()
const getLevel = (xp: number) => {
  // Progressive XP requirements: 100, 200, 400, 700, 1100, 1600...
  let level = 1
  let totalXP = 0
  let xpForLevel = 100

  while (totalXP + xpForLevel <= xp) {
    totalXP += xpForLevel
    level++
    xpForLevel = level * 100
  }

  return level
}

const getXPForNextLevel = (level: number) => (level + 1) * 100

const getXPProgress = (xp: number, level: number) => {
  let totalXPForPreviousLevels = 0
  for (let i = 1; i < level; i++) {
    totalXPForPreviousLevels += i * 100
  }
  return xp - totalXPForPreviousLevels
}

const calculateXPFromProgress = (habit: Habit): number => {
  const progressRatio = habit.progress / habit.target

  if (habit.type === 'water') {
    if (progressRatio >= 1) return 25 // Full target
    if (progressRatio >= 0.75) return 20 // 75% target
    if (progressRatio >= 0.5) return 15 // 50% target
    if (progressRatio >= 0.25) return 10 // 25% target
    return Math.floor(progressRatio * 25) // Proportional
  } else {
    // For exercise, meditation, reading
    if (progressRatio >= 2) return 30 // 2x target
    if (progressRatio >= 1.5) return 25 // 1.5x target
    if (progressRatio >= 1) return 20 // Full target
    if (progressRatio >= 0.75) return 15 // 75% target
    if (progressRatio >= 0.5) return 10 // 50% target
    return Math.floor(progressRatio * 20) // Proportional
  }
}

const getTargetOptions = (type: string) => {
  switch (type) {
    case 'water':
      return [{ value: 2, label: '2L' }, { value: 3, label: '3L' }, { value: 4, label: '4L' }, { value: 6, label: '6L' }]
    case 'exercise':
      return [{ value: 30, label: '30min' }, { value: 60, label: '1hr' }, { value: 90, label: '1.5hr' }, { value: 120, label: '2hr' }]
    case 'meditation':
      return [{ value: 15, label: '15min' }, { value: 30, label: '30min' }, { value: 45, label: '45min' }, { value: 60, label: '1hr' }]
    case 'reading':
      return [{ value: 30, label: '30min' }, { value: 60, label: '1hr' }, { value: 90, label: '1.5hr' }, { value: 120, label: '2hr' }]
    default:
      return []
  }
}

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userData, setUserData] = useState<UserData>({
    habits: getInitialHabits(),
    totalXP: 0,
    level: 1,
    badges: getInitialBadges(),
    lastVisitDate: getTodayKey()
  })
  const [todayQuote, setTodayQuote] = useState('')
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser)
      setAuthLoading(false)
      
      if (authUser) {
        console.log('User authenticated:', authUser.email)
      } else {
        console.log('User signed out')
        // Clear user data when signed out
        setUserData({
          habits: getInitialHabits(),
          totalXP: 0,
          level: 1,
          badges: getInitialBadges(),
          lastVisitDate: getTodayKey()
        })
      }
    })

    return () => unsubscribe()
  }, [])

  // Load data from Firebase/localStorage on mount
  useEffect(() => {
    // Only load data if user is authenticated
    if (!user) return
    
    const loadData = async () => {
      setIsLoading(true)

      // Set loading timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        console.warn('Loading timeout reached, using default data')
        setUserData({
          habits: getInitialHabits(),
          totalXP: 0,
          level: 1,
          badges: getInitialBadges(),
          lastVisitDate: getTodayKey()
        })
        setToastMessage('⚠️ Using offline mode - data will sync when possible')
        setTimeout(() => setToastMessage(''), 3000)
        setIsLoading(false)
      }, 10000) // 10 second timeout

      try {
        const savedData = await loadUserData()

        if (savedData) {
          // Check for new day and reset progress
          const updatedData = checkAndResetDailyProgress(savedData)

          // Add any missing badges
          const currentBadgeIds = updatedData.badges.map(b => b.id)
          const initialBadges = getInitialBadges()
          const missingBadges = initialBadges.filter(b => !currentBadgeIds.includes(b.id))

          if (missingBadges.length > 0) {
            updatedData.badges.push(...missingBadges)
          }

          setUserData(updatedData)

          // Save back to Firebase if we made changes (non-blocking)
          if (updatedData !== savedData) {
            saveUserData(updatedData).catch(error =>
              console.warn('Background save failed:', error)
            )
          }

          // Show connection status
          setToastMessage('✅ Data loaded successfully!')
          setTimeout(() => setToastMessage(''), 2000)
        } else {
          // Initialize with default data
          const initialData: UserData = {
            habits: getInitialHabits(),
            totalXP: 0,
            level: 1,
            badges: getInitialBadges(),
            lastVisitDate: getTodayKey()
          }
          setUserData(initialData)

          // Save to Firebase in background (non-blocking)
          saveUserData(initialData).catch(error =>
            console.warn('Initial save failed:', error)
          )

          // Welcome new user
          setToastMessage('🎮 Welcome to GlowUp!')
          setTimeout(() => setToastMessage(''), 3000)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to default data
        setUserData({
          habits: getInitialHabits(),
          totalXP: 0,
          level: 1,
          badges: getInitialBadges(),
          lastVisitDate: getTodayKey()
        })
        setToastMessage('⚠️ Started in offline mode')
        setTimeout(() => setToastMessage(''), 3000)
      }

      clearTimeout(loadingTimeout)
      setIsLoading(false)
    }

    loadData()

    // Set daily quote based on date
    const quoteIndex = new Date().getDate() % motivationalQuotes.length
    setTodayQuote(motivationalQuotes[quoteIndex])
  }, [user])

  // Save to Firebase whenever userData changes (non-blocking)
  useEffect(() => {
    if (!isLoading && user) {
      saveUserData(userData).catch(error =>
        console.warn('Background save failed:', error)
      )
    }
  }, [userData, isLoading, user])

  const handleSignOut = async () => {
    try {
      await logOut()
      setToastMessage('👋 Signed out successfully!')
      setTimeout(() => setToastMessage(''), 2000)
    } catch (error) {
      console.error('Sign out error:', error)
      setToastMessage('❌ Sign out failed')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  const updateHabitProgress = (id: string, newProgress: number) => {
    setUserData(prev => {
      const updatedHabits = prev.habits.map(habit => {
        if (habit.id === id) {
          const targetMet = newProgress >= habit.target
          const wasTargetMet = habit.progress >= habit.target
          const today = getTodayKey()

          // Calculate new XP based on progress
          const newHabit = { ...habit, progress: newProgress }
          const newXP = calculateXPFromProgress(newHabit)

          // Show feedback message
          if (targetMet && !wasTargetMet) {
            setToastMessage(`🎉 ${habit.name} completed! +${newXP} XP earned!`)
            setTimeout(() => setToastMessage(''), 3000)
          } else if (newProgress > habit.progress) {
            setToastMessage(`📈 ${habit.name} progress updated to ${newProgress}${habit.progressUnit}`)
            setTimeout(() => setToastMessage(''), 2000)
          }

          return {
            ...habit,
            progress: newProgress,
            completedToday: targetMet,
            streakCount: targetMet && !wasTargetMet ? habit.streakCount + 1 : habit.streakCount,
            xpEarned: newXP,
            lastCompletedDate: targetMet ? today : habit.lastCompletedDate
          }
        }
        return habit
      })

      const newTotalXP = updatedHabits.reduce((sum, h) => sum + h.xpEarned, 0)
      const newLevel = getLevel(newTotalXP)

      // Check for new badges
      const updatedBadges = prev.badges.map(badge => {
        const condition = badgeConditions[badge.id]
        if (condition && typeof condition === 'function') {
          const shouldUnlock = condition(updatedHabits) && !badge.unlocked
          if (shouldUnlock) {
            setNewBadges(prevNew => [...prevNew, badge])
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
            return { ...badge, unlocked: true, unlockedDate: getTodayKey() }
          }
        }
        return badge
      })

      return {
        ...prev,
        habits: updatedHabits,
        totalXP: newTotalXP,
        level: newLevel,
        badges: updatedBadges
      }
    })
  }

  const updateHabitTarget = (id: string, newTarget: number) => {
    const habit = userData.habits.find(h => h.id === id)
    if (habit) {
      setToastMessage(`🎯 ${habit.name} target updated to ${newTarget}${habit.targetUnit}!`)
      setTimeout(() => setToastMessage(''), 2000)
    }

    setUserData(prev => {
      const updatedHabits = prev.habits.map(habit => {
        if (habit.id === id) {
          const updatedHabit = { ...habit, target: newTarget }
          const newXP = calculateXPFromProgress(updatedHabit)
          return { ...updatedHabit, xpEarned: newXP }
        }
        return habit
      })

      const newTotalXP = updatedHabits.reduce((sum, h) => sum + h.xpEarned, 0)
      const newLevel = getLevel(newTotalXP)

      return {
        ...prev,
        habits: updatedHabits,
        totalXP: newTotalXP,
        level: newLevel
      }
    })
  }

  const dismissNewBadges = () => {
    setNewBadges([])
  }

  const getProgressPercentage = (habit: Habit) => {
    return Math.min((habit.progress / habit.target) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-400 to-green-600'
    if (percentage >= 75) return 'from-yellow-400 to-orange-500'
    if (percentage >= 50) return 'from-blue-400 to-cyan-500'
    if (percentage >= 25) return 'from-purple-400 to-pink-500'
    return 'from-gray-400 to-gray-600'
  }

  const getUnlockedBadges = () => userData.badges.filter(badge => badge.unlocked)
  const getProgressToNextLevel = () => {
    const current = getXPProgress(userData.totalXP, userData.level)
    const needed = getXPForNextLevel(userData.level)
    return (current / needed) * 100
  }

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚡</div>
          <div className="text-xl neon-text font-bold">INITIALIZING GLOWUP...</div>
          <div className="text-sm text-cyan-300 mt-2">Checking authentication...</div>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={() => {}} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚡</div>
          <div className="text-xl neon-text font-bold">INITIALIZING GLOWUP...</div>
          <div className="text-sm text-cyan-300 mt-2">Loading your wellness data...</div>
          <div className="text-xs text-gray-400 mt-3">If this takes too long, we'll start in offline mode</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 floating">
          <h1 className="text-6xl font-black neon-text neon-flicker mb-4">⚡ GLOWUP ⚡</h1>
          <p className="text-xl text-cyan-300 font-medium tracking-wide">GAMIFY YOUR WELLNESS JOURNEY</p>
          <div className="flex justify-center items-center space-x-4 mt-3">
            <div className="flex space-x-2 text-2xl">
              <span className="neon-pink">●</span>
              <span className="neon-text">●</span>
              <span className="neon-green">●</span>
              <span className="neon-yellow">●</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 font-bold">DATA SYNCED</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors font-medium"
                title="Sign Out"
              >
                👤 {user.email} • LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="glow-card p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="border border-cyan-500/30 rounded-lg p-3 bg-cyan-500/10">
              <div className="text-3xl font-bold neon-text">{userData.totalXP}</div>
              <div className="text-cyan-300/80 text-sm tracking-wide">TOTAL XP</div>
            </div>
            <div className="border border-pink-500/30 rounded-lg p-3 bg-pink-500/10">
              <div className="text-3xl font-bold neon-pink">LVL {userData.level}</div>
              <div className="text-pink-300/80 text-sm tracking-wide">CURRENT LEVEL</div>
            </div>
            <div className="border border-green-500/30 rounded-lg p-3 bg-green-500/10">
              <div className="text-3xl font-bold neon-green">{userData.habits.reduce((sum, h) => sum + h.streakCount, 0)}</div>
              <div className="text-green-300/80 text-sm tracking-wide">STREAKS</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-cyan-300 mb-2">
              <span className="font-semibold">NEXT LEVEL PROGRESS</span>
              <span className="neon-text">{getXPProgress(userData.totalXP, userData.level)}/{getXPForNextLevel(userData.level)} XP</span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-4 border border-cyan-500/30">
              <div
                className="progress-bar h-4 rounded-full transition-all duration-500 ease-out glow-rotate"
                style={{ width: `${getProgressToNextLevel()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Daily Quote */}
        <div className="glow-card p-6 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold neon-yellow mb-3 tracking-wider">⚡ DAILY MOTIVATION ⚡</h3>
            <p className="text-xl text-cyan-100 italic font-medium leading-relaxed">{todayQuote}</p>
          </div>
        </div>

        {/* Habits */}
        <div className="glow-card p-6 mb-6">
          <h3 className="text-xl font-bold neon-text mb-6 tracking-wider text-center">⚡ TODAY'S MISSIONS ⚡</h3>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {userData.habits.map(habit => {
              const progressPercentage = getProgressPercentage(habit)
              const progressColor = getProgressColor(progressPercentage)

              return (
                <div
                  key={habit.id}
                  className={`habit-card p-4 transition-all duration-300 ${
                    habit.completedToday
                      ? 'habit-completed'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl relative">
                        {habit.icon}
                        {habit.completedToday && (
                          <div className="absolute -inset-1 rounded-full bg-green-400/30 animate-ping"></div>
                        )}
                      </div>
                      <div>
                        <div className={`font-bold text-lg ${
                          habit.completedToday ? 'neon-green' : 'text-cyan-100'
                        }`}>
                          {habit.name.toUpperCase()}
                        </div>
                        <div className="text-sm flex items-center space-x-3 mt-1">
                          <span className="flex items-center space-x-1">
                            <span className="text-orange-400">🔥</span>
                        <span className="text-orange-300 font-semibold">{habit.streakCount}</span>
                        <span className="text-orange-200 text-xs">STREAK</span>
                      </span>
                      <span className="text-yellow-400">●</span>
                      <span className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-yellow-300 font-semibold">{habit.xpEarned || 0}</span>
                        <span className="text-yellow-200 text-xs">XP EARNED</span>
                      </span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      habit.completedToday
                        ? 'bg-green-500/80 border-green-400 scale-110 neon-green shadow-lg shadow-green-500/50'
                        : 'border-cyan-400/50'
                    }`}>
                      {habit.completedToday ? (
                        <span className="text-white text-2xl font-bold">✓</span>
                      ) : (
                        <div className="w-6 h-6 border-2 border-cyan-400/30 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-300 font-semibold">
                          {habit.progress}{habit.progressUnit} /
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowSettingsModal(habit.id)
                          }}
                          className="text-pink-400 font-bold hover:text-pink-300 transition-colors hover:scale-105 transform"
                          title="Open Mission Settings"
                        >
                          {habit.target}{habit.targetUnit} ⚙️
                        </button>
                      </div>
                      <span className={`font-bold ${
                        progressPercentage >= 100 ? 'neon-green' :
                        progressPercentage >= 75 ? 'text-yellow-400' :
                        'text-cyan-300'
                      }`}>
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800/50 rounded-full h-3 border border-cyan-500/30">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${progressColor}`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Progress Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const quickAmount = habit.type === 'water' ? 0.5 : 15
                        updateHabitProgress(habit.id, habit.progress + quickAmount)
                      }}
                      className="px-2 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-400/50 text-cyan-300 rounded-lg font-bold text-xs hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-cyan-400 transition-all"
                    >
                      ➕ {habit.type === 'water' ? '0.5L' : '15m'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateHabitProgress(habit.id, habit.target)
                      }}
                      className="px-2 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 text-green-300 rounded-lg font-bold text-xs hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400 transition-all"
                    >
                      🎯 DONE
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateHabitProgress(habit.id, 0)
                      }}
                      className="px-2 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 text-red-300 rounded-lg font-bold text-xs hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400 transition-all"
                    >
                      🔄 RESET
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="glow-card p-6 mb-6">
          <h3 className="text-xl font-bold neon-pink mb-6 tracking-wider text-center">�� ACHIEVEMENT MATRIX 🏆</h3>
          <div className="grid grid-cols-2 gap-4">
            {getUnlockedBadges().map((badge) => (
              <div key={badge.id} className="streak-badge p-4 rounded-lg text-center relative border border-pink-500/30">
                <div className="text-3xl mb-2 relative">
                  {badge.icon}
                  {badge.unlockedDate === getTodayKey() && (
                    <>
                      <div className="absolute -inset-2 border-2 border-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    </>
                  )}
                </div>
                <div className="text-white font-bold text-xs tracking-widest">{badge.name.toUpperCase()}</div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50"></div>
              </div>
            ))}
            {userData.badges.filter(b => !b.unlocked).map((badge) => (
              <div key={badge.id} className="p-4 rounded-lg text-center bg-gray-900/50 border border-gray-700/50 opacity-40 hover:opacity-60 transition-opacity">
                <div className="text-3xl mb-2 grayscale filter blur-sm">{badge.icon}</div>
                <div className="text-gray-400 font-medium text-xs tracking-widest">{badge.name.toUpperCase()}</div>
                <div className="text-xs text-gray-500 mt-1">LOCKED</div>
              </div>
            ))}
          </div>
          {getUnlockedBadges().length === 0 && (
            <div className="text-center text-cyan-300 py-6 border border-cyan-500/30 rounded-lg bg-cyan-500/10 mt-4">
              <div className="neon-text text-lg font-bold mb-2">NO ACHIEVEMENTS YET</div>
              <div className="text-cyan-200 text-sm">Complete missions to unlock badges! ⚡</div>
            </div>
          )}
        </div>

        {/* New Badge Popup */}
        {newBadges.length > 0 && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glow-card p-8 text-center max-w-md w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-pink-500/20 animate-pulse"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold neon-yellow mb-6 tracking-wider">⚡ ACHIEVEMENT UNLOCKED! ⚡</h3>
                {newBadges.map((badge, index) => (
                  <div key={index} className="mb-6">
                    <div className="text-6xl mb-4 animate-bounce">{badge.icon}</div>
                    <div className="text-2xl neon-pink font-bold tracking-wide">{badge.name.toUpperCase()}</div>
                  </div>
                ))}
                <button
                  onClick={dismissNewBadges}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-lg font-bold text-lg hover:from-pink-600 hover:to-cyan-600 transition-all transform hover:scale-105 tracking-wider border border-pink-400/50"
                >
                  LEGENDARY! ⚡
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40">
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 animate-bounce text-5xl neon-yellow">⚡</div>
            <div className="absolute top-20 left-1/4 transform -translate-x-1/2 animate-bounce delay-100 text-4xl neon-pink">💥</div>
            <div className="absolute top-15 right-1/4 transform translate-x-1/2 animate-bounce delay-200 text-4xl neon-text">⭐</div>
            <div className="absolute top-32 left-1/3 transform -translate-x-1/2 animate-bounce delay-300 text-3xl neon-green">🔥</div>
            <div className="absolute top-25 right-1/3 transform translate-x-1/2 animate-bounce delay-400 text-3xl neon-yellow">✨</div>
            <div className="absolute top-40 left-1/6 transform -translate-x-1/2 animate-bounce delay-500 text-2xl neon-pink">💫</div>
            <div className="absolute top-35 right-1/6 transform translate-x-1/2 animate-bounce delay-600 text-2xl neon-text">🎊</div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Feature Info Section */}
        <div className="glow-card p-4 mb-6 text-center">
          <h3 className="text-lg font-bold neon-yellow mb-3">🚀 NEW FEATURES</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border border-cyan-500/30 rounded-lg bg-cyan-500/10">
              <div className="neon-text font-bold mb-1">⚙️ SMART SETTINGS</div>
              <div className="text-gray-300">Click target values to see XP previews and streak rules</div>
            </div>
            <div className="p-3 border border-pink-500/30 rounded-lg bg-pink-500/10">
              <div className="neon-pink font-bold mb-1">🔄 AUTO SYNC</div>
              <div className="text-gray-300">Data saves to cloud when possible, works offline too</div>
            </div>
            <div className="p-3 border border-green-500/30 rounded-lg bg-green-500/10">
              <div className="neon-green font-bold mb-1">📊 DAILY RESET</div>
              <div className="text-gray-300">Streaks count once per day, progress resets at midnight</div>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <SettingsModal
            habit={userData.habits.find(h => h.id === showSettingsModal)!}
            isOpen={!!showSettingsModal}
            onClose={() => setShowSettingsModal(null)}
            onUpdateTarget={updateHabitTarget}
          />
        )}
      </div>
    </div>
  )
}
