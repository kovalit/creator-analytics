/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        primary: 'var(--primary)',
        'primary-soft': 'var(--primary-soft)',
        'primary-strong': 'var(--primary-strong)',
        secondary: 'var(--secondary)',
        'secondary-soft': 'var(--secondary-soft)',
        success: 'var(--success)',
        'success-soft': 'var(--success-soft)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        pill: '999px',
        card: '20px',
        'card-lg': '24px',
        'card-sm': '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.02), 0 8px 24px rgba(15,23,42,.04)',
        'card-hover': '0 2px 4px rgba(15,23,42,.03), 0 12px 32px rgba(15,23,42,.07)',
        pop: '0 4px 12px rgba(15,23,42,.06), 0 16px 48px rgba(15,23,42,.10)',
      },
      fontSize: {
        kpi: ['30px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'kpi-lg': ['38px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'page-title': ['28px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out',
      },
    },
  },
  plugins: [],
};
