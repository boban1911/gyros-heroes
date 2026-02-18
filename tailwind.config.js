
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hero-blue-dark': '#1F3B81',
        'hero-blue': '#4866B0',
        'hero-yellow-dark': '#B07400',
        'hero-yellow': '#FBAD18',
        'grey-black': '#212121',
        'grey-middle': '#9596A4',
        'grey-light': '#D0D1DD',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
