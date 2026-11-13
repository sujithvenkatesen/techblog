/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#030407',
        cobalt: '#1558C9',
        lime: '#D4FF24',
        glass: 'rgba(12, 15, 24, 0.65)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['Anton', 'Impact', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        cobalt: '0 0 0 1px rgba(21,88,201,.9), 0 12px 50px -8px rgba(21,88,201,.55)',
        lime: '0 10px 40px -10px rgba(212,255,36,.55)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'spin-slow': 'spinSlow 60s linear infinite',
        'spin-slower': 'spinSlow 110s linear infinite reverse',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
