/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./extension/src/**/*.{js,ts,jsx,tsx}",
    "./extension/src/popup/*.html"
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        dark: {
          bg: '#0f0f0f',
          surface: '#1a1a1a',
          card: '#262626',
          border: '#404040',
          text: {
            primary: '#e5e5e5',
            secondary: '#a3a3a3',
            muted: '#737373'
          }
        }
      }
    },
  },
  plugins: [],
}

