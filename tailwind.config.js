/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#F9F9F9',
        surface: '#FFFFFF',
        primary: '#4CAF50',
        danger: '#FF5252',
        foreground: '#1A1A1A',
        'muted-foreground': '#AAAAAA',
        separator: '#E8E8E8',
      },
    },
  },
  plugins: [],
};
