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
    condition: (habits: Habit[]) => habits.find(h => h.name === 'Drink Water' && h.streakCount >= 7) !== undefined,
    unlocked: false
  },
  {
    id: 'mindful-master',
    name: 'Mindful Master',
    icon: '🧘‍♀️',
    condition: (habits: Habit[]) => habits.find(h => h.name === 'Meditate' && h.streakCount >= 5) !== undefined,
    unlocked: false
  },
  {
    id: 'consistency-champ',
    name: 'Consistency Champ',
    icon: '👑',
    condition: (habits: Habit[]) => habits.every(h => h.streakCount >= 7),
    unlocked: false
  },
  {
    id: 'fitness-warrior',
    name: 'Fitness Warrior',
    icon: '🏃‍♂️',
    condition: (habits: Habit[]) => habits.find(h => h.name === 'Exercise' && h.streakCount >= 5) !== undefined,
    unlocked: false
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    icon: '📚',
    condition: (habits: Habit[]) => habits.find(h => h.name === 'Read' && h.streakCount >= 3) !== undefined,
    unlocked: false
  },
  {
    id: 'wellness-champion',
    name: 'Wellness Champion',
    icon: '🏆',
    condition: (habits: Habit[]) => habits.reduce((sum, h) => sum + h.streakCount, 0) >= 20,
    unlocked: false
  }
]

const getInitialHabits = (): Habit[] => [
  { id: '1', name: 'Drink Water', streakCount: 0, completedToday: false, xpEarned: 0, icon: '💧' },
  { id: '2', name: 'Exercise', streakCount: 0, completedToday: false, xpEarned: 0, icon: '🏃‍♂️' },
  { id: '3', name: 'Meditate', streakCount: 0, completedToday: false, xpEarned: 0, icon: '🧘‍♀️' },
  { id: '4', name: 'Read', streakCount: 0, completedToday: false, xpEarned: 0, icon: '📚' },
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">✨ GlowUp</h1>
          <p className="text-xl text-white/80">Gamify your wellness journey</p>
        </div>

        {/* Stats Card */}
        <div className="glow-card p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{userData.totalXP}</div>
              <div className="text-white/70">Total XP</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Level {userData.level}</div>
              <div className="text-white/70">Current Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userData.habits.reduce((sum, h) => sum + h.streakCount, 0)}</div>
              <div className="text-white/70">Total Streaks</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>Progress to Level {userData.level + 1}</span>
              <span>{getXPProgress(userData.totalXP, userData.level)}/{getXPForNextLevel(userData.level)} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressToNextLevel()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Daily Quote */}
        <div className="glow-card p-6 mb-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">🌅 Daily Motivation</h3>
          <p className="text-xl text-white/90 italic">{todayQuote}</p>
        </div>

        {/* Habits */}
        <div className="glow-card p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">🎯 Today's Habits</h3>
          <div className="space-y-3">
            {userData.habits.map(habit => (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  habit.completedToday
                    ? 'bg-gradient-to-r from-green-400/20 to-blue-400/20 hover:from-green-400/30 hover:to-blue-400/30'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <div className="text-white font-medium">{habit.name}</div>
                    <div className="text-white/70 text-sm flex items-center space-x-2">
                      <span>🔥 {habit.streakCount} day streak</span>
                      <span>•</span>
                      <span>⭐ {habit.xpEarned} XP earned</span>
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  habit.completedToday
                    ? 'bg-green-500 border-green-500 scale-110'
                    : 'border-white/50 hover:border-white/80'
                }`}>
                  {habit.completedToday && <span className="text-white text-lg">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="glow-card p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {getUnlockedBadges().map((badge) => (
              <div key={badge.id} className="streak-badge p-3 rounded-lg text-center relative">
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-white font-medium text-sm">{badge.name}</div>
                {badge.unlockedDate === getTodayKey() && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </div>
            ))}
            {userData.badges.filter(b => !b.unlocked).map((badge) => (
              <div key={badge.id} className="p-3 rounded-lg text-center bg-white/5 border border-white/20 opacity-50">
                <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                <div className="text-white/50 font-medium text-sm">{badge.name}</div>
              </div>
            ))}
          </div>
          {getUnlockedBadges().length === 0 && (
            <div className="text-center text-white/70 py-4">
              Complete habits to unlock badges! 🏆
            </div>
          )}
        </div>

        {/* New Badge Popup */}
        {newBadges.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glow-card p-6 text-center max-w-sm w-full animate-pulse">
              <h3 className="text-2xl font-bold text-white mb-4">🎉 New Badge Unlocked!</h3>
              {newBadges.map((badge, index) => (
                <div key={index} className="mb-4">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="text-xl text-white font-bold">{badge.name}</div>
                </div>
              ))}
              <button
                onClick={dismissNewBadges}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Awesome! ✨
              </button>
            </div>
          </div>
        )}

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="text-4xl">🎉</div>
            </div>
            <div className="absolute top-10 left-1/4 transform -translate-x-1/2 animate-bounce delay-100">
              <div className="text-3xl">✨</div>
            </div>
            <div className="absolute top-5 right-1/4 transform translate-x-1/2 animate-bounce delay-200">
              <div className="text-3xl">🎆</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
