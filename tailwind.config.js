/** @type {import('tailwindcss').Config} */
export default {
  // ダークモードはclassで制御
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ブランドカラー
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        // ダーク背景
        dark: {
          bg:     '#0a0e17',
          card:   '#111827',
          border: '#1f2937',
        },
      },
      animation: {
        'slide-in':  'slideIn 0.2s ease-out',
        'fade-in':   'fadeIn 0.15s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
