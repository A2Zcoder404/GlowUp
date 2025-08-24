'use client'

import { useState, useEffect } from 'react'
import { signIn, signUp } from '../lib/auth'
import { testFirebaseConnection } from '../lib/firebase-test'

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      onLogin()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 floating">
          <h1 className="text-6xl font-black neon-text neon-flicker mb-4">⚡ GLOWUP ⚡</h1>
          <p className="text-xl text-cyan-300 font-medium tracking-wide">ENTER THE WELLNESS MATRIX</p>
          <div className="flex justify-center items-center space-x-2 mt-3">
            <div className="flex space-x-2 text-2xl">
              <span className="neon-pink">●</span>
              <span className="neon-text">●</span>
              <span className="neon-green">●</span>
              <span className="neon-yellow">●</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="glow-card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold neon-pink tracking-wider">
                {isSignUp ? '🚀 CREATE ACCOUNT' : '🔐 ACCESS PORTAL'}
              </h2>
              <p className="text-cyan-300 text-sm mt-2">
                {isSignUp ? 'Join the wellness revolution' : 'Welcome back, warrior'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2 tracking-wide">
                  📧 EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800/80 border border-cyan-400/50 rounded-lg text-white font-medium focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="your.email@domain.com"
                />
              </div>

              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2 tracking-wide">
                  🔒 PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800/80 border border-cyan-400/50 rounded-lg text-white font-medium focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="Enter your password"
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-cyan-300 text-sm font-bold mb-2 tracking-wide">
                    🔒 CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-800/80 border border-cyan-400/50 rounded-lg text-white font-medium focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-lg tracking-wider transition-all transform hover:scale-105 ${
                  loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white hover:from-cyan-600 hover:to-pink-600 neon-text'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>PROCESSING...</span>
                  </div>
                ) : (
                  <>⚡ {isSignUp ? 'CREATE ACCOUNT' : 'ENTER GLOWUP'} ⚡</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                className="text-cyan-300 hover:text-cyan-100 font-medium transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="neon-pink font-bold">SIGN IN</span></>
                ) : (
                  <>Need an account? <span className="neon-pink font-bold">SIGN UP</span></>
                )}
              </button>
            </div>

            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <h3 className="text-center text-cyan-300 font-bold mb-4 tracking-wide">🎮 WHAT AWAITS YOU</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center p-2 border border-cyan-500/30 rounded-lg bg-cyan-500/10">
                  <div className="neon-text font-bold">🔥 STREAKS</div>
                  <div className="text-gray-300">Build consistency</div>
                </div>
                <div className="text-center p-2 border border-pink-500/30 rounded-lg bg-pink-500/10">
                  <div className="neon-pink font-bold">⭐ XP SYSTEM</div>
                  <div className="text-gray-300">Level up daily</div>
                </div>
                <div className="text-center p-2 border border-green-500/30 rounded-lg bg-green-500/10">
                  <div className="neon-green font-bold">🏆 BADGES</div>
                  <div className="text-gray-300">Unlock achievements</div>
                </div>
                <div className="text-center p-2 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                  <div className="neon-yellow font-bold">💫 QUOTES</div>
                  <div className="text-gray-300">Daily motivation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>🌟 Transform your wellness journey into an epic adventure 🌟</p>
        </div>
      </div>
    </div>
  )
}
