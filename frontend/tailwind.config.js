/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF4F9",
          100: "#D7E2EF",
          400: "#5277A0",
          600: "#2A5286",
          700: "#1E3A5F", // Perpak kurumsal lacivert
          800: "#152B47",
          900: "#0E1E33",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
