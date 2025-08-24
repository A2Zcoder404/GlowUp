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
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{xp}</div>
              <div className="text-white/70">XP Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Level {level}</div>
              <div className="text-white/70">Current Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{habits.reduce((sum, h) => sum + h.streak, 0)}</div>
              <div className="text-white/70">Total Streaks</div>
            </div>
          </div>
        </div>

        {/* Daily Quote */}
        <div className="glow-card p-6 mb-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Daily Motivation</h3>
          <p className="text-xl text-white/90">{todayQuote}</p>
        </div>

        {/* Habits */}
        <div className="glow-card p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Today's Habits</h3>
          <div className="space-y-3">
            {habits.map(habit => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <div className="text-white font-medium">{habit.name}</div>
                    <div className="text-white/70 text-sm">🔥 {habit.streak} day streak</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  habit.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-white/50'
                }`}>
                  {habit.completed && <span className="text-white text-sm">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="glow-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {getBadges().map((badge, index) => (
              <div key={index} className="streak-badge p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-white font-medium text-sm">{badge.name}</div>
              </div>
            ))}
            {getBadges().length === 0 && (
              <div className="col-span-2 text-center text-white/70 py-4">
                Complete habits to earn badges! 🏆
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
