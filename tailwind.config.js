/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f2f4f7',
          100: '#dde3ec',
          200: '#b7c2d6',
          300: '#8d9cba',
          400: '#5c6f94',
          500: '#3a4d73',
          600: '#283a5c',
          700: '#1c2c47',
          800: '#141f33',
          900: '#0d1522',
        },
        amber: {
          50: '#fdf6e9',
          100: '#f9e7c0',
          200: '#f1cd80',
          300: '#e8b347',
          400: '#d9971f',
          500: '#b87a12',
          600: '#92600d',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
