/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // Prevents Tailwind base reset from conflicting with Material UI and custom CSS
  },
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0c10',
          card: '#121722',
          cardLight: '#181f2f',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#6366f1',
          primaryLight: '#818cf8',
          secondary: '#ec4899',
          accent: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-secondary': '0 0 25px -5px rgba(236, 72, 153, 0.4)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
