/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        // CSS-variable-driven theme tokens
        background: 'var(--bg)',
        surface:    'var(--surface)',
        border:     'var(--border-c)',
        primary:    'var(--primary)',
        secondary:  'var(--secondary)',
        // "Midnight Engineering" indigo/teal accent system
        accent:          'var(--accent)',
        accent2:         'var(--accent-2)',
        accentLight:     'var(--accent-muted)',
        success:         'var(--success)',
        'accent-deep':   'var(--accent-deep)',
        'accent-muted':  'var(--accent-muted)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
