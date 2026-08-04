import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#031b3d",
          900: "#062654",
          800: "#0b3978"
        },
        brand: {
          600: "#0969f9",
          500: "#0ea5e9",
          400: "#19c7dc"
        }
      },
      boxShadow: {
        card: "0 8px 28px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
export default config;
