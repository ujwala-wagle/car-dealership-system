/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        obsidian: {
          950: '#07090E',
          900: '#0B0F17',
          850: '#101520',
          800: '#161D2B',
          700: '#222C3D',
          600: '#324056',
        },
        gold: {
          400: '#E6C665',
          500: '#D4AF37',
          600: '#B89626',
        },
        slate: {
          850: '#172033',
        }
      },
    },
  },
  plugins: [],
}

