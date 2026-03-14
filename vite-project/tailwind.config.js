/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },

      keyframes: {
  coinSpin: {
    '0%': { transform: 'rotateY(0deg)' },
    '100%': { transform: 'rotateY(360deg)' },
  },
},
animation: {
  coinSpin: 'coinSpin 4s linear infinite',
},
    },
  },
  plugins: [],
};