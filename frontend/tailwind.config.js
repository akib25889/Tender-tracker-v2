/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          elevation2: '#F1F5F9',
          dim: '#CBDBF5',
          container: '#E5EEFF',
          low: '#EFF4FF',
          high: '#DCE9FF',
          highest: '#D3E4FE',
        },
        shell: {
          DEFAULT: '#0F172A',
          elevated: '#1E293B',
          border: '#334155',
          muted: '#94A3B8',
        },
        primary: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          container: '#131B2E',
        },
        secondary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          container: '#316BF3',
          fixed: '#DBE1FF',
        },
        tertiary: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          container: '#25005A',
        },
        urgent: {
          DEFAULT: '#DC2626',
          container: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
        },
        attention: {
          DEFAULT: '#EA580C',
          container: '#FFF7ED',
          border: '#FED7AA',
          text: '#C2410C',
        },
        preparation: {
          DEFAULT: '#D97706',
          container: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
        },
        success: {
          DEFAULT: '#16A34A',
          container: '#F0FDF4',
          border: '#BBF7D0',
          text: '#15803D',
        },
        discovery: {
          DEFAULT: '#2563EB',
          container: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1D4ED8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F5F9',
          dark: '#334155',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        'sidebar-expanded': '16rem',
        'sidebar-collapsed': '4.5rem',
        'header-height': '3.5rem',
      },
      boxShadow: {
        'level-1': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'level-2': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'level-3': '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

