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
        'glow-purple': '#8b5cf6',
        'glow-pink': '#ec4899',
        'glow-blue': '#3b82f6',
      },
    },
  },
  plugins: [],
}
