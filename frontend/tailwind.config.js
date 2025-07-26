/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Classic theme
        'classic-light': '#22c55e',
        'classic-dark': '#16a34a',
        
        // Ocean theme
        'ocean-light': '#3b82f6',
        'ocean-dark': '#1d4ed8',
        
        // Sunset theme
        'sunset-light': '#f97316',
        'sunset-dark': '#ea580c',
        
        // Forest theme
        'forest-light': '#059669',
        'forest-dark': '#047857',
        
        // Royal theme
        'royal-light': '#8b5cf6',
        'royal-dark': '#7c3aed',
        
        // Pink theme
        'pink-light': '#ec4899',
        'pink-dark': '#db2777',
        
        // Mint theme
        'mint-light': '#10b981',
        'mint-dark': '#059669',
        
        // Lavender theme
        'lavender-light': '#a78bfa',
        'lavender-dark': '#8b5cf6',
        
        // Coral theme
        'coral-light': '#fb7185',
        'coral-dark': '#f43f5e',
        
        // Sky theme
        'sky-light': '#0ea5e9',
        'sky-dark': '#0284c7',
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%':
