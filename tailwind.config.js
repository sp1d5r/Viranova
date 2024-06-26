const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");


module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        "text": "#FEFDF6",
        "background": "#010C0F",
        "primary": "#047857",
        "secondary": "#093909",
        "accent": "#059669",
        "button-primary": "#C8EF9F",
        "button-secondary": "#E0FAE0",
        "danger": "#B64A4A",
        "warning": "#b6904a",
        "success": "#58b64a",
        "info": "#4a4fb6",
        "gradient": "linear-gradient(180deg, #093909 0%, #35DC32 100%)"
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "0.5" },
          "70%": { opacity: "0.5" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.5s ease-out forwards',
        scroll:
          "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
        "meteor-effect": "meteor 5s linear infinite",
      },
    },
  },
  plugins: [addVariablesForColors,],
}

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}