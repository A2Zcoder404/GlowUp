'use client'

import { useState, useEffect } from 'react'

interface Habit {
  id: string
  name: string
  streakCount: number
  completedToday: boolean
  xpEarned: number
  icon: string
  lastCompletedDate?: string
  type: 'water' | 'exercise' | 'meditation' | 'reading'
  target: number
  targetUnit: string
  progress: number
  progressUnit: string
}

interface Badge {
  id: string
  name: string
  icon: string
  condition: (habits: Habit[]) => boolean
  unlocked: boolean
  unlockedDate?: string
}

interface UserData {
  habits: Habit[]
  totalXP: number
  level: number
  badges: Badge[]
  lastVisitDate: string
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

const getInitialBadges = (): Badge[] => [
  {
    id: 'hydration-hero',
    name: 'Hydration Hero',
    icon: '💧',
    condition: (habits: Habit[]) => habits.find(h => h.type === 'water' && h.streakCount >= 7) !== undefined,
    unlocked: false
  },
  {
    id: 'fitness-warrior',
    name: 'Fitness Warrior',
    icon: '🏃‍♂️',
    condition: (habits: Habit[]) => habits.find(h => h.type === 'exercise' && h.streakCount >= 7) !== undefined,
    unlocked: false
  },
  {
    id: 'mindful-master',
    name: 'Mindful Master',
    icon: '🧘‍♀️',
    condition: (habits: Habit[]) => habits.find(h => h.type === 'meditation' && h.streakCount >= 7) !== undefined,
    unlocked: false
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    icon: '📚',
    condition: (habits: Habit[]) => habits.find(h => h.type === 'reading' && h.streakCount >= 7) !== undefined,
    unlocked: false
  },
  {
    id: 'wellness-champion',
    name: 'Wellness Champion',
    icon: '🏆',
    condition: (habits: Habit[]) => habits.every(h => h.streakCount >= 30),
    unlocked: false
  },
  {
    id: 'consistency-master',
    name: 'Consistency Master',
    icon: '👑',
    condition: (habits: Habit[]) => habits.filter(h => h.streakCount >= 14).length >= 3,
    unlocked: false
  }
]

const getInitialHabits = (): Habit[] => [
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
]

const getTodayKey = () => new Date().toDateString()
const getLevel = (xp: number) => Math.floor(xp / 100) + 1
const getXPForNextLevel = (level: number) => level * 100
const getXPProgress = (xp: number, level: number) => xp - ((level - 1) * 100)

export default function Home() {
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('glowup-data')
    if (savedData) {
      const parsed = JSON.parse(savedData) as UserData

      // Check if it's a new day - reset completedToday but maintain streaks
      const today = getTodayKey()
      if (parsed.lastVisitDate !== today) {
        const resetHabits = parsed.habits.map(habit => ({
          ...habit,
          completedToday: false,
          // If user didn't complete habit yesterday, reset streak
          streakCount: habit.lastCompletedDate === parsed.lastVisitDate ? habit.streakCount : 0
        }))

        setUserData({
          ...parsed,
          habits: resetHabits,
          lastVisitDate: today
        })
      } else {
        setUserData(parsed)
      }
    }

    // Set daily quote based on date
    const quoteIndex = new Date().getDate() % motivationalQuotes.length
    setTodayQuote(motivationalQuotes[quoteIndex])
  }, [])

  // Save to localStorage whenever userData changes
  useEffect(() => {
    localStorage.setItem('glowup-data', JSON.stringify(userData))
  }, [userData])

  const toggleHabit = (id: string) => {
    setUserData(prev => {
      const updatedHabits = prev.habits.map(habit => {
        if (habit.id === id) {
          const newCompleted = !habit.completedToday
          const xpGain = 10
          const today = getTodayKey()

          if (newCompleted) {
            return {
              ...habit,
              completedToday: true,
              streakCount: habit.streakCount + 1,
              xpEarned: habit.xpEarned + xpGain,
              lastCompletedDate: today
            }
          } else {
            return {
              ...habit,
              completedToday: false,
              streakCount: Math.max(0, habit.streakCount - 1),
              xpEarned: Math.max(0, habit.xpEarned - xpGain)
            }
          }
        }
        return habit
      })

      const newTotalXP = updatedHabits.reduce((sum, h) => sum + h.xpEarned, 0)
      const newLevel = getLevel(newTotalXP)

      // Check for new badges
      const updatedBadges = prev.badges.map(badge => {
        const shouldUnlock = badge.condition(updatedHabits) && !badge.unlocked
        if (shouldUnlock) {
          setNewBadges(prevNew => [...prevNew, badge])
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          return { ...badge, unlocked: true, unlockedDate: getTodayKey() }
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

  const dismissNewBadges = () => {
    setNewBadges([])
  }

  const getUnlockedBadges = () => userData.badges.filter(badge => badge.unlocked)
  const getProgressToNextLevel = () => {
    const current = getXPProgress(userData.totalXP, userData.level)
    const needed = getXPForNextLevel(userData.level)
    return (current / needed) * 100
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 floating">
          <h1 className="text-6xl font-black neon-text neon-flicker mb-4">⚡ GLOWUP ⚡</h1>
          <p className="text-xl text-cyan-300 font-medium tracking-wide">GAMIFY YOUR WELLNESS JOURNEY</p>
          <div className="flex justify-center space-x-2 mt-2 text-2xl">
            <span className="neon-pink">●</span>
            <span className="neon-text">●</span>
            <span className="neon-green">●</span>
            <span className="neon-yellow">●</span>
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
          <div className="space-y-4">
            {userData.habits.map(habit => (
              <div
                key={habit.id}
                className={`habit-card flex items-center justify-between p-4 cursor-pointer transition-all duration-300 ${
                  habit.completedToday
                    ? 'habit-completed completion-animation'
                    : 'hover:scale-102'
                }`}
                onClick={() => toggleHabit(habit.id)}
              >
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
                        <span className="text-yellow-300 font-semibold">{habit.xpEarned}</span>
                        <span className="text-yellow-200 text-xs">XP</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  habit.completedToday
                    ? 'bg-green-500/80 border-green-400 scale-110 neon-green shadow-lg shadow-green-500/50'
                    : 'border-cyan-400/50 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30'
                }`}>
                  {habit.completedToday ? (
                    <span className="text-white text-2xl font-bold">✓</span>
                  ) : (
                    <div className="w-6 h-6 border-2 border-cyan-400/30 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="glow-card p-6 mb-6">
          <h3 className="text-xl font-bold neon-pink mb-6 tracking-wider text-center">🏆 ACHIEVEMENT MATRIX 🏆</h3>
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
      </div>
    </div>
  )
}
