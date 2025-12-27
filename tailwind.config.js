/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#137fec",
        "primary-hover": "#1068c2",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "card-dark": "#1a1d21",
        "card-hover-dark": "#22252a",
        "surface-dark": "#1c2630",
        "surface-dark-hover": "#24303b",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
}