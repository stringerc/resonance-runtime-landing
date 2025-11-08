const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        brand: {
          50: "#f4f7ff",
          100: "#e6eeff",
          200: "#c5d6ff",
          300: "#99b3ff",
          400: "#6c8eff",
          500: "#3f67f5",
          600: "#274dd8",
          700: "#1d3eb1",
          800: "#163289",
          900: "#0f255f",
          950: "#070f2e",
        },
        surface: {
          50: "#f7f8fb",
          100: "#eef0f6",
          200: "#d8dce7",
          300: "#b3bbcf",
          400: "#8a95b3",
          500: "#687298",
          600: "#515a7d",
          700: "#414865",
          800: "#343a51",
          900: "#1d2133",
          950: "#111424",
        },
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        warning: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5f5",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0f255f 0%, #3f67f5 50%, #10b981 100%)",
        "brand-radial": "radial-gradient(circle at 20% 20%, rgba(63, 103, 245, 0.45), transparent 55%)",
      },
      boxShadow: {
        "brand-sm": "0 8px 24px rgba(15, 37, 95, 0.12)",
        "brand-md": "0 20px 45px rgba(15, 37, 95, 0.15)",
        "brand-glow": "0 0 0 1px rgba(63, 103, 245, 0.35), 0 30px 60px -20px rgba(63, 103, 245, 0.55)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      screens: {
        "3xl": "1680px",
      },
    },
  },
  plugins: [],
};

