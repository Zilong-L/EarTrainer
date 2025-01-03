/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { 
      fontFamily: {
      jazz: ['Chilanka-Regular', 'sans-serif'], // 'jazz' is the utility class name
    },},
  },
  plugins: [],
}
