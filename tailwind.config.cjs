/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F0F4FF',
        'bg-secondary': '#FFFFFF',
        surface: 'rgba(255, 255, 255, 0.95)',
        'surface-elevated': '#FFFFFF',
        primary: '#4A90E2',
        'primary-dark': '#2E5C8A',
        'primary-light': '#7AB8FF',
        secondary: '#6C63FF',
        'secondary-light': '#9990FF',
        accent: '#00D9A3',
        'accent-light': '#4DFFCC',
        medical: '#00C9A7',
        'medical-light': '#E0FFF9',
        text: '#1A202C',
        'text-secondary': '#4A5568',
        'text-muted': '#718096',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'btn': '16px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(74, 144, 226, 0.08)',
        'card-hover': '0 8px 32px rgba(74, 144, 226, 0.15)',
        'glow': '0 0 24px rgba(74, 144, 226, 0.3)',
        'glow-secondary': '0 0 24px rgba(108, 99, 255, 0.3)',
        'glow-accent': '0 0 24px rgba(0, 217, 163, 0.3)',
        'elevated': '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(74, 144, 226, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(74, 144, 226, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

