'use client'

import { useState } from 'react'

interface Habit {
  id: string
  name: string
  streak: number
  completed: boolean
  icon: string
}

const motivationalQuotes = [
  "Progress, not perfection! 🌟",
  "Every small step counts! 💫",
  "You're building something amazing! ✨",
  "Consistency is your superpower! 🚀",
  "Today's effort is tomorrow's strength! 💪"
]

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Drink Water', streak: 7, completed: false, icon: '💧' },
    { id: '2', name: 'Exercise', streak: 3, completed: false, icon: '🏃‍♂️' },
    { id: '3', name: 'Meditate', streak: 5, completed: false, icon: '🧘‍♀️' },
    { id: '4', name: 'Read', streak: 2, completed: false, icon: '📚' },
  ])

  const [xp, setXp] = useState(250)
  const [level, setLevel] = useState(3)
  const [todayQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const newCompleted = !habit.completed
        if (newCompleted) {
          setXp(prev => prev + 25)
          return { ...habit, completed: newCompleted, streak: habit.streak + 1 }
        } else {
          setXp(prev => prev - 25)
          return { ...habit, completed: newCompleted, streak: Math.max(0, habit.streak - 1) }
        }
      }
      return habit
    }))
  }

  const getBadges = () => {
    const badges = []
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0)
    
    if (totalStreak >= 20) badges.push({ name: 'Consistency Master', icon: '👑' })
    if (habits.find(h => h.name === 'Drink Water' && h.streak >= 7)) badges.push({ name: 'Hydration Hero', icon: '💧' })
    if (habits.find(h => h.name === 'Exercise' && h.streak >= 5)) badges.push({ name: 'Fitness Champion', icon: '🏆' })
    if (habits.find(h => h.streak >= 7)) badges.push({ name: '7-Day Streak', icon: '🔥' })
    
    return badges
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
