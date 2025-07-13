/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#1976d2',
          600: '#1565c0',
          700: '#0d47a1',
          800: '#0b3d91',
          900: '#062272',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // disable Tailwind's reset to avoid conflicts with MUI
  },
  important: '#__next', // needed for MUI + Tailwind compatibility
}
