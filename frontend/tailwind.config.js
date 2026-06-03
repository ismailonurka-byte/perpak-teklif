/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F1F5FA",
          100: "#DCE7F3",
          200: "#BBCEE6",
          300: "#8FACD2",
          400: "#5277A0",
          500: "#33598A",
          600: "#2A5286",
          700: "#1E3A5F", // Perpak kurumsal lacivert
          800: "#152B47",
          900: "#0E1E33",
          950: "#081320",
        },
        // Sıcak, premium vurgu — lacivere karşı kontrast (CTA highlight, aktif vurgular)
        accent: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Sora", "Manrope", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
        "card-hover": "0 6px 16px -4px rgba(15,23,42,0.10), 0 2px 6px -2px rgba(15,23,42,0.06)",
        elevated: "0 16px 40px -12px rgba(15,23,42,0.18)",
        brand: "0 10px 24px -10px rgba(30,58,95,0.45)",
        "inner-line": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      backgroundImage: {
        "brand-grad": "linear-gradient(160deg, #1E3A5F 0%, #152B47 55%, #0E1E33 100%)",
        "brand-sheen": "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 40%)",
        "grid-faint":
          "linear-gradient(rgba(30,58,95,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,0.05) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.45s cubic-bezier(0.21,0.6,0.35,1) both",
        "scale-in": "scale-in 0.2s ease-out both",
        "slide-up": "slide-up 0.3s cubic-bezier(0.21,0.6,0.35,1) both",
      },
    },
  },
  plugins: [],
};
