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

interface TargetModalProps {
  habit: Habit
  isOpen: boolean
  onClose: () => void
  onUpdateTarget: (habitId: string, newTarget: number) => void
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

export default function TargetModal({ habit, isOpen, onClose, onUpdateTarget }: TargetModalProps) {
  const [selectedTarget, setSelectedTarget] = useState(habit.target)
  const [customTarget, setCustomTarget] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  if (!isOpen) return null

  const targetOptions = getTargetOptions(habit.type)

  const handleSave = () => {
    const newTarget = showCustom ? parseFloat(customTarget) || habit.target : selectedTarget
    onUpdateTarget(habit.id, newTarget)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glow-card p-6 max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold neon-text tracking-wider">
              ⚙️ SET TARGET
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
              Current: {habit.target}{habit.targetUnit}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-bold neon-yellow">CHOOSE TARGET:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              {targetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedTarget(option.value)
                    setShowCustom(false)
                  }}
                  className={`p-3 rounded-lg border-2 transition-all font-bold text-sm ${
                    selectedTarget === option.value && !showCustom
                      ? 'border-cyan-400 bg-cyan-400/20 neon-text'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-cyan-400/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowCustom(!showCustom)}
                className={`w-full p-3 rounded-lg border-2 transition-all font-bold text-sm ${
                  showCustom
                    ? 'border-pink-400 bg-pink-400/20 neon-pink'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-pink-400/50'
                }`}
              >
                🎯 CUSTOM TARGET
              </button>
              
              {showCustom && (
                <div className="mt-3">
                  <input
                    type="number"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder={`Enter ${habit.targetUnit}`}
                    className="w-full p-3 bg-gray-800/80 border border-pink-400/50 rounded-lg text-white font-bold text-center focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                  />
                </div>
              )}
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-lg font-bold hover:from-cyan-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              SAVE TARGET
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
