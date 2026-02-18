
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
        'hero-green': '#3E9C5B',
        'grey-black': '#212121',
        'grey-middle': '#9596A4',
        'grey-light': '#D0D1DD',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      spacing: {
        'xs': '10px',
        'sm': '12px',
        '100': '100px',
        '200': '200px',
      },
      borderRadius: {
        'md': '60px',
        'lg': '80px',
      },
      boxShadow: {
        'hero-xs': '0px 1px 2px 0px rgba(198,228,246,0.05)',
        'hero-focus': '0px 1px 2px 0px rgba(16,24,40,0.05), 0px 0px 0px 4px #FBAD18',
      },
    },
  },
  plugins: [],
}
