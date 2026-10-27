/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D97706',
        secondary: '#F59E0B',
        accent: '#FBBF24',
        gold: '#D97706',
        maroon: '#8B2635',
        ivory: '#FFFBEB',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
        'gradient-gold-soft': 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(217, 119, 6, 0.25)',
        'gold-lg': '0 10px 40px 0 rgba(217, 119, 6, 0.3)',
      }
    },
  },
  plugins: [],
}
