/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Opus 4.5 Aurora Theme - Deep Space + Neon
        'dark': {
          950: '#030014', // Deep void
          900: '#0a0a1a', // Space black
          850: '#0f0f23', // Dark nebula
          800: '#151530', // Card dark
          700: '#1f1f4a', // Border glow
          600: '#2d2d6a', // Muted
          500: '#4a4a8a', // Accent muted
        },
        'aurora': {
          cyan: '#00f5ff',     // Electric cyan
          blue: '#00a8ff',     // Neon blue
          purple: '#8b5cf6',   // Vivid purple
          pink: '#f472b6',     // Hot pink
          magenta: '#e879f9',  // Magenta
          emerald: '#10b981',  // Matrix green
          lime: '#a3e635',     // Lime accent
        },
        'neon': {
          primary: '#6366f1',
          glow: '#818cf8',
          secondary: '#22d3ee',
          accent: '#f472b6',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'aurora': 'aurora 8s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.4)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.3), inset 0 0 20px rgba(0, 245, 255, 0.1)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.5), inset 0 0 40px rgba(0, 245, 255, 0.2)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)',
          },
          '50%': {
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(30deg)',
          },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'border-glow': {
          '0%, 100%': {
            borderColor: 'rgba(99, 102, 241, 0.5)',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
          },
          '50%': {
            borderColor: 'rgba(0, 245, 255, 0.5)',
            boxShadow: '0 0 25px rgba(0, 245, 255, 0.4)'
          },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #00f5ff 50%, #f472b6 75%, #6366f1 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00f5ff, #6366f1, #f472b6, #00f5ff)',
        'cyber-grid': 'linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'aurora': '400% 400%',
        'grid': '50px 50px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(99, 102, 241, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)',
        'neon-pink': '0 0 20px rgba(244, 114, 182, 0.5), 0 0 40px rgba(244, 114, 182, 0.3)',
        'glow-lg': '0 0 60px rgba(99, 102, 241, 0.4)',
        'inner-glow': 'inset 0 0 30px rgba(99, 102, 241, 0.2)',
      },
      dropShadow: {
        'neon': '0 0 20px rgba(99, 102, 241, 0.8)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
