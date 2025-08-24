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
        { value: 2, label: '2L', description: 'Light hydration', baseXP: 10 },
        { value: 3, label: '3L', description: 'Recommended daily', baseXP: 15 },
        { value: 4, label: '4L', description: 'Active lifestyle', baseXP: 20 },
        { value: 6, label: '6L', description: 'Athlete level', baseXP: 25 }
      ]
    case 'exercise':
      return [
        { value: 30, label: '30min', description: 'Light workout', baseXP: 10 },
        { value: 60, label: '1hr', description: 'Recommended daily', baseXP: 15 },
        { value: 90, label: '1.5hr', description: 'Intensive training', baseXP: 20 },
        { value: 120, label: '2hr', description: 'Athlete level', baseXP: 25 }
      ]
    case 'meditation':
      return [
        { value: 15, label: '15min', description: 'Quick mindfulness', baseXP: 10 },
        { value: 30, label: '30min', description: 'Standard practice', baseXP: 15 },
        { value: 45, label: '45min', description: 'Deep meditation', baseXP: 20 },
        { value: 60, label: '1hr', description: 'Extended practice', baseXP: 25 }
      ]
    case 'reading':
      return [
        { value: 30, label: '30min', description: 'Light reading', baseXP: 10 },
        { value: 60, label: '1hr', description: 'Daily reading', baseXP: 15 },
        { value: 90, label: '1.5hr', description: 'Book lover', baseXP: 20 },
        { value: 120, label: '2hr', description: 'Scholar level', baseXP: 25 }
      ]
    default:
      return []
  }
}

// Get base XP for a specific target value
const getBaseXPForTarget = (type: string, targetValue: number): number => {
  const options = getTargetOptions(type)
  const option = options.find(opt => opt.value === targetValue)
  if (option) {
    return option.baseXP
  }

  // For custom targets, calculate based on closest preset
  const sortedOptions = options.sort((a, b) => Math.abs(a.value - targetValue) - Math.abs(b.value - targetValue))
  if (sortedOptions.length > 0) {
    // Scale XP based on target difficulty
    const closest = sortedOptions[0]
    const ratio = targetValue / closest.value
    return Math.round(closest.baseXP * ratio)
  }

  return 15 // Default fallback
}

const calculateXPFromProgress = (habit: Habit, newTarget: number): number => {
  const baseXP = getBaseXPForTarget(habit.type, newTarget)
  const progressRatio = habit.progress / newTarget

  // Calculate XP based on progress ratio
  if (progressRatio >= 2) return Math.round(baseXP * 1.5) // 150% XP for 200% completion
  if (progressRatio >= 1.5) return Math.round(baseXP * 1.25) // 125% XP for 150% completion
  if (progressRatio >= 1) return baseXP // Full XP for 100% completion
  if (progressRatio >= 0.75) return Math.round(baseXP * 0.75) // 75% XP
  if (progressRatio >= 0.5) return Math.round(baseXP * 0.5) // 50% XP
  if (progressRatio >= 0.25) return Math.round(baseXP * 0.25) // 25% XP
  return Math.floor(progressRatio * baseXP) // Proportional XP
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
      <div className="glow-card max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        {/* Fixed Header */}
        <div className="relative z-10 p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
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
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 px-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <div className="space-y-6 pb-4">
            {/* Habit Info Header */}
            <div className="text-center p-4 border border-cyan-500/30 rounded-lg bg-cyan-500/10">
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
            <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
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
            <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/10">
              <h4 className="text-lg font-bold text-orange-400 mb-2">🔥 STREAK RULES</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Streaks increase by +1 when you complete your daily target</div>
                <div>• Only ONE streak increase per habit per day</div>
                <div>• Missing your target resets that habit's streak to 0</div>
                <div>• Higher targets = more XP but same streak progression</div>
              </div>
            </div>

            {/* Target Selection */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold neon-text">🎯 CHOOSE YOUR CHALLENGE:</h4>
              
              <div className="grid grid-cols-1 gap-3">
                {targetOptions.map((option) => {
                  const baseXP = option.baseXP
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
                          <div className="text-yellow-400 font-bold">⭐ {baseXP} XP</div>
                          <div className="text-xs text-gray-400">base reward</div>
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
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="relative z-10 p-6 pt-4 flex-shrink-0 border-t border-gray-700/50">
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
