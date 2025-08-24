/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff00ff',
        'neon-green': '#00ff00',
        'neon-yellow': '#ffff00',
        'neon-orange': '#ff8800',
        'dark-bg': '#0a0e1a',
        'dark-card': '#0d1421',
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'progress-glow': 'progress-glow 2s ease-in-out infinite alternate',
        'neon-flicker': 'neon-flicker 2s ease-in-out infinite alternate',
        'glow-rotate': 'glow-rotate 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'completion-flash': 'completion-flash 0.5s ease-in-out',
        'glitch': 'glitch 2s infinite',
      },
      boxShadow: {
        'neon': '0 0 20px currentColor',
        'neon-lg': '0 0 40px currentColor',
        'neon-xl': '0 0 60px currentColor',
      }
    },
  },
  plugins: [],
}
