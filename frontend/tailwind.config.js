/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cinema-bg': '#0a0a0c',
        'cinema-card': 'rgba(25, 25, 30, 0.7)',
        'cinema-red': '#e50914',
        'cinema-red-hover': '#ff1f2a',
        'cinema-glass': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(229, 9, 20, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
