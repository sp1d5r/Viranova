/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        "text": "#FEFDF6",
        "background": "#010C0F",
        "primary": "#35DC32",
        "secondary": "#093909",
        "accent": "#C8EF9F",
        "button-primary": "#C8EF9F",
        "button-secondary": "#E0FAE0",
        "danger": "#B64A4A",
        "warning": "#b6904a",
        "success": "#58b64a",
        "info": "#4a4fb6",
        "gradient": "linear-gradient(180deg, #093909 0%, #35DC32 100%)"
      }
    },
  },
  plugins: [],
}

