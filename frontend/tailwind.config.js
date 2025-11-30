/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
          400: '#34d399',
        },
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
          400: '#818cf8',
        },
      },
    },
  },
  plugins: [],
}