/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./consulta-veicular/**/*.html",
    "./servicos/**/*.html",
    "./noticias/**/*.html",
    "./politica/**/*.html",
    "./atualidades/**/*.html",
    "./conteudo/**/*.html",
    "./app.js",
    "./consulta-veicular/js/**/*.js"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        brand: {
          900: '#0F1B35',
          800: '#172B53',
          700: '#1E40AF',
          600: '#2563EB',
          50: '#EFF6FF'
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7'
        },
        success: '#059669',
        danger: '#DC2626',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F6F8FC'
        },
        'text-primary': '#172033',
        'text-secondary': '#526078',
        border: '#D9E1EC',
        cobalto: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#0f172a'
        },
        amarelo: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04'
        },
        limao: {
          50: '#f7fee7',
          100: '#ecfccb',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f'
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px'
      }
    }
  },
  plugins: [],
}
