/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0b2965",
        card: "#ffffff",
        surface: "#f9fafb",
        heading: "#111827",
        bodyText: "#4b5563",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(2, 29, 84, 0.04), 0 1px 3px rgba(2, 29, 84, 0.06)",
        elevate:
          "0 10px 30px rgba(2, 29, 84, 0.08), 0 2px 8px rgba(2, 29, 84, 0.04)",
      },
    },
  },
  plugins: [],
};
