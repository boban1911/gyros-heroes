/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'hero-blue': '#4866b0',
        'hero-yellow': '#fbad18',
        'hero-green': '#3e9c5b',
        'hero-dark-blue': '#1f3b81',
        'hero-dark': '#212121',
      },
    },
  },
  plugins: [],
}
