/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: { 
      colors: {
        'bg-main': 'var(--bg-main)',
        'bg-common': 'var(--bg-common)',
        'bg-accent': 'var(--bg-accent)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'showcase-bg': 'var(--showcase-bg)',
        'showcase-separator': 'var(--showcase-separator)',
        'showcase-text': 'var(--showcase-text)',
        'notification-text': 'var(--notification-text)',
        'notification-bg': 'var(--notification-bg)',
      },
      fontFamily: {
        chewy: ['Chewy-Regular', 'cursive'], // 'chewy' is the utility class name
        chinese: ['Chinese', ], // 'chewy' is the utility class name
      },
    },
  },
  plugins: [],
}
