'use client'

import { useState } from 'react'

interface Habit {
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

interface ProgressModalProps {
  habit: Habit
  isOpen: boolean
  onClose: () => void
  onUpdateProgress: (habitId: string, newProgress: number) => void
}

export default function ProgressModal({ habit, isOpen, onClose, onUpdateProgress }: ProgressModalProps) {
  const [progress, setProgress] = useState(habit.progress.toString())

  if (!isOpen) return null

  const handleSave = () => {
    const newProgress = parseFloat(progress) || 0
    onUpdateProgress(habit.id, newProgress)
    onClose()
  }

  const getQuickAddOptions = () => {
    if (habit.type === 'water') {
      return [0.25, 0.5, 1, 2]
    } else {
      return [15, 30, 60, 120]
    }
  }

  const addProgress = (amount: number) => {
    const newProgress = (parseFloat(progress) || 0) + amount
    setProgress(newProgress.toString())
  }

  const progressPercentage = Math.min((parseFloat(progress) || 0) / habit.target * 100, 100)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glow-card p-6 max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold neon-green tracking-wider">
              📊 UPDATE PROGRESS
            </h3>
            <button 
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{habit.icon}</div>
            <div className="text-xl neon-pink font-bold tracking-wide">
              {habit.name.toUpperCase()}
            </div>
            <div className="text-sm text-cyan-300 mt-1">
              Target: {habit.target}{habit.targetUnit} • Current: {habit.progress}{habit.progressUnit}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-cyan-300 mb-2">
              <span>PROGRESS</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-4 border border-cyan-500/30">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${
                  progressPercentage >= 100 ? 'from-green-400 to-green-600' :
                  progressPercentage >= 75 ? 'from-yellow-400 to-orange-500' :
                  progressPercentage >= 50 ? 'from-blue-400 to-cyan-500' :
                  progressPercentage >= 25 ? 'from-purple-400 to-pink-500' :
                  'from-gray-400 to-gray-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="mb-6">
            <h4 className="text-lg font-bold neon-yellow mb-3">QUICK ADD:</h4>
            <div className="grid grid-cols-2 gap-3">
              {getQuickAddOptions().map((amount) => (
                <button
                  key={amount}
                  onClick={() => addProgress(amount)}
                  className="p-3 rounded-lg border border-yellow-400/50 bg-yellow-400/10 text-yellow-300 font-bold text-sm hover:bg-yellow-400/20 hover:border-yellow-400 transition-all"
                >
                  +{amount}{habit.progressUnit}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input */}
          <div className="mb-6">
            <h4 className="text-lg font-bold neon-text mb-3">TOTAL PROGRESS:</h4>
            <input
              type="number"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder={`Enter ${habit.progressUnit}`}
              className="w-full p-3 bg-gray-800/80 border border-cyan-400/50 rounded-lg text-white font-bold text-center text-xl focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            <div className="text-center text-sm text-gray-400 mt-2">
              {habit.progressUnit}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
