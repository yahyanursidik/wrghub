/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8F4',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#18201D',
          light: '#2D3833',
          muted: '#59675F',
        },
        border: {
          DEFAULT: '#E3E7E2',
          light: '#EEF2EC',
          dark: '#CAD3C9',
        },
        primary: {
          50: '#F0F7F4',
          100: '#DCEEE6',
          200: '#B8DDD0',
          300: '#86C4B0',
          400: '#4DA58B',
          500: '#245C4A',
          600: '#1D4C3D',
          700: '#173D31',
          800: '#122E25',
          900: '#0C1F19',
          DEFAULT: '#245C4A',
        },
        accent: {
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          blue: '#3B82F6',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(24, 55, 39, 0.035)',
        'card-hover': '0 6px 18px rgba(24, 55, 39, 0.07)',
        'modal': '0 20px 60px -12px rgba(24, 55, 39, 0.2)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
