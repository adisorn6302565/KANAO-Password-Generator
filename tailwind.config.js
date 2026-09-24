/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./utils/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
          extend: {
            fontFamily: {
              sans: ['Prompt', 'sans-serif'],
            },
            colors: {
              brand: {
                dark: '#0f172a',
                primary: '#6366f1',
                secondary: '#06b6d4',
              }
            },
            keyframes: {
              'fade-in-up': {
                '0%': { opacity: '0', transform: 'translateY(4px) scale(0.98)' },
                '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
              }
            },
            animation: {
              'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              'fade-in': 'fade-in-up 0.4s ease-out forwards',
            }
          }
        },
  plugins: [],
};
