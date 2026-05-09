/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#F8AC12',
        'primary-dark': '#d4900e',
        foreground: '#0D0D0D',
        background: '#FAFAF8',
        muted: '#6B7280',
        border: '#E5E7EB',
        secondary: '#F3F4F6',
        accent: '#F8AC12',
      },
    },
  },
  plugins: [],
}
