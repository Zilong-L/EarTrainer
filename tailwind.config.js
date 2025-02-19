/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: { 
      animation: {
        floatCard: 'floatCard 4s ease-in-out infinite',
        hoverCard: 'hoverCard 2s ease-in-out  forwards', // New hover animation
        hoverCardReverse: 'hoverCardReverse 2s ease-in-out  forwards', // New hover animation
      },
      keyframes: {
        floatCard: {
          '0%': { transform: 'rotateZ(var(--z-rotate, 0deg)) translateY(var(--base-translateY, 0%))  rotateY(0deg)' },
          '50%': { transform: 'rotateZ(var(--z-rotate, 0deg)) translateY(calc(var(--base-translateY, 0%) ))  rotateY(-15deg)' },
          '100%': { transform: 'rotateZ(var(--z-rotate, 0deg)) translateY(var(--base-translateY, 0%))  rotateY(0deg)' }
        },
        hoverCard: {
          '0%': { transform: 'rotateZ(var(--z-rotate)) translateY(var(--base-translateY)) scale(1)' },
          '100%': { transform: 'translateY(4rem) rotateX(var(--hover-rotateX, 10deg)) rotateY(var(--hover-rotateY, 10deg)) translateX(var(--hover-offsetX, 0%)) scale(1.3)' },
        },
        hoverCardReverse: {
          '0%': { transform: 'translateY(4rem) rotateX(var(--hover-rotateX, 10deg)) rotateY(var(--hover-rotateY, 10deg)) translateX(var(--hover-offsetX, 0%)) scale(1.3)' },
          '100%': { transform: 'rotateZ(var(--z-rotate)) translateY(var(--base-translateY)) scale(1)' }, // Back to normal
        },
      },
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
        jazz: ['Chilanka-Regular', 'sans-serif'], // 'jazz' is the utility class name
        chewy: ['Chewy-Regular', 'cursive'], // 'chewy' is the utility class name
      },
    },
  },
  plugins: [],
}
