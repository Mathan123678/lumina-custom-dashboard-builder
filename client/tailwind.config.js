/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1", // Indigo 500
          hover: "#4f46e5",   // Indigo 600
          light: "#818cf8",   // Indigo 400
        },
        slate: {
          950: "#020617",
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
        },
        emerald: {
          DEFAULT: "#10b981",
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
