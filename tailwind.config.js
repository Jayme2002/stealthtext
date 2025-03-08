/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f7f7f8',
          100: '#ececf1',
          200: '#d9d9e3',
          300: '#c5c5d2',
          400: '#8e8ea0',
          500: '#6e6e80',
          600: '#4a4a5a',
          700: '#343541',
          800: '#202123',
          900: '#0f0f10',
        }
      }
    },
  },
  plugins: [],
};