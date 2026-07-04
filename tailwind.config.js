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
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        danger: 'var(--color-danger)',
        edit: {
          DEFAULT: 'var(--color-edit)',
          foreground: 'var(--color-edit-foreground)',
        },
        foreground: 'var(--color-foreground)',
        'muted-foreground': 'var(--color-muted-foreground)',
        separator: 'var(--color-separator)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        destructive: 'var(--color-danger)',
      },
    },
  },
  plugins: [],
};
