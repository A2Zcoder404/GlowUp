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

interface SettingsModalProps {
  habit: Habit
  isOpen: boolean
  onClose: () => void
  onUpdateTarget: (habitId: string, newTarget: number) => void
}

const getTargetOptions = (type: string) => {
  switch (type) {
    case 'water':
      return [
        { value: 2, label: '2L', description: 'Light hydration' },
        { value: 3, label: '3L', description: 'Recommended daily' },
        { value: 4, label: '4L', description: 'Active lifestyle' },
        { value: 6, label: '6L', description: 'Athlete level' }
      ]
    case 'exercise':
      return [
        { value: 30, label: '30min', description: 'Light workout' },
        { value: 60, label: '1hr', description: 'Recommended daily' },
        { value: 90, label: '1.5hr', description: 'Intensive training' },
        { value: 120, label: '2hr', description: 'Athlete level' }
      ]
    case 'meditation':
      return [
        { value: 15, label: '15min', description: 'Quick mindfulness' },
        { value: 30, label: '30min', description: 'Standard practice' },
        { value: 45, label: '45min', description: 'Deep meditation' },
        { value: 60, label: '1hr', description: 'Extended practice' }
      ]
    case 'reading':
      return [
        { value: 30, label: '30min', description: 'Light reading' },
        { value: 60, label: '1hr', description: 'Daily reading' },
        { value: 90, label: '1.5hr', description: 'Book lover' },
        { value: 120, label: '2hr', description: 'Scholar level' }
      ]
    default:
      return []
  }
}

const calculateXPFromProgress = (habit: Habit, newTarget: number): number => {
  const progressRatio = habit.progress / newTarget
  
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

const getXPRangeForTarget = (type: string, target: number) => {
  if (type === 'water') {
    return { min: 0, max: 25, full: 25 }
  } else {
    return { min: 0, max: 30, full: 20 }
  }
}

export default function SettingsModal({ habit, isOpen, onClose, onUpdateTarget }: SettingsModalProps) {
  const [selectedTarget, setSelectedTarget] = useState(habit.target)
  const [customTarget, setCustomTarget] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  if (!isOpen) return null

  const targetOptions = getTargetOptions(habit.type)
  const currentXP = habit.xpEarned
  const previewXP = calculateXPFromProgress(habit, selectedTarget)
  const xpDifference = previewXP - currentXP
  const xpRange = getXPRangeForTarget(habit.type, selectedTarget)

  const handleSave = () => {
    const newTarget = showCustom ? parseFloat(customTarget) || habit.target : selectedTarget
    onUpdateTarget(habit.id, newTarget)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glow-card p-6 max-w-lg w-full relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold neon-text tracking-wider">
              ⚙️ MISSION SETTINGS
            </h3>
            <button 
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Habit Info Header */}
          <div className="text-center mb-6 p-4 border border-cyan-500/30 rounded-lg bg-cyan-500/10">
            <div className="text-4xl mb-2">{habit.icon}</div>
            <div className="text-xl neon-pink font-bold tracking-wide">
              {habit.name.toUpperCase()}
            </div>
            <div className="text-sm text-cyan-300 mt-2">
              Current Progress: {habit.progress}{habit.progressUnit} / {habit.target}{habit.targetUnit}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              🔥 {habit.streakCount} day streak • ⭐ {habit.xpEarned} XP earned
            </div>
          </div>

          {/* XP Preview Section */}
          <div className="mb-6 p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
            <h4 className="text-lg font-bold neon-yellow mb-3">💡 XP CALCULATION PREVIEW</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Current XP:</span>
                <span className="text-yellow-400 font-bold">{currentXP} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">New Target XP:</span>
                <span className="text-cyan-400 font-bold">{previewXP} XP</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2">
                <span className="text-gray-300">XP Difference:</span>
                <span className={`font-bold ${xpDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {xpDifference >= 0 ? '+' : ''}{xpDifference} XP
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                💡 Max possible XP for this target: {xpRange.max} XP (at 200% completion)
              </div>
            </div>
          </div>

          {/* Streak Info */}
          <div className="mb-6 p-4 border border-orange-500/30 rounded-lg bg-orange-500/10">
            <h4 className="text-lg font-bold text-orange-400 mb-2">🔥 STREAK RULES</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>• Streaks increase by +1 when you complete your daily target</div>
              <div>• Only ONE streak increase per habit per day</div>
              <div>• Missing your target resets that habit's streak to 0</div>
              <div>• Higher targets = more XP but same streak progression</div>
            </div>
          </div>

          {/* Target Selection */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-bold neon-text">🎯 CHOOSE YOUR CHALLENGE:</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {targetOptions.map((option) => {
                const optionXP = calculateXPFromProgress(habit, option.value)
                const isSelected = selectedTarget === option.value && !showCustom
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedTarget(option.value)
                      setShowCustom(false)
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-400/20 neon-text'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">{option.label}</div>
                        <div className="text-sm opacity-80">{option.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">⭐ {optionXP} XP</div>
                        <div className="text-xs text-gray-400">current progress</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Custom Target Option */}
            <div className="mt-4">
              <button
                onClick={() => setShowCustom(!showCustom)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  showCustom
                    ? 'border-pink-400 bg-pink-400/20 neon-pink'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-pink-400/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">🎯 CUSTOM TARGET</div>
                    <div className="text-sm opacity-80">Set your own challenge level</div>
                  </div>
                  <div className="text-pink-400 font-bold">⚡ UNLIMITED</div>
                </div>
              </button>
              
              {showCustom && (
                <div className="mt-3">
                  <input
                    type="number"
                    value={customTarget}
                    onChange={(e) => {
                      setCustomTarget(e.target.value)
                      if (e.target.value) {
                        setSelectedTarget(parseFloat(e.target.value))
                      }
                    }}
                    placeholder={`Enter ${habit.targetUnit}`}
                    className="w-full p-3 bg-gray-800/80 border border-pink-400/50 rounded-lg text-white font-bold text-center focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                  />
                  <div className="text-xs text-gray-400 text-center mt-2">
                    Custom target XP: {showCustom && customTarget ? calculateXPFromProgress(habit, parseFloat(customTarget) || habit.target) : 0} XP
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
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
              UPDATE TARGET
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
