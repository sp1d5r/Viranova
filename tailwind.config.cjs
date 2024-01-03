module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "text": "#FEFDF6",
        "background": "#040401",
        "primary": "#35DC32",
        "secondary": "#093909",
        "accent": "#C8EF9F",
        "button-primary": "#C8EF9F",
        "button-secondary": "#E0FAE0",
        "gradient": "linear-gradient(180deg, #093909 0%, #35DC32 100%)"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
