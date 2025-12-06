/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/content-pages/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
        display: ["system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 0 0% 3.9%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 262 83% 58%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 100%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 0 0% 96.1%))",
          foreground: "hsl(var(--muted-foreground, 0 0% 45.1%))",
        },
        border: "hsl(var(--border, 0 0% 89.8%))",
      },
    },
  },
  plugins: [],
};
