import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#fff5f6",
          100: "#ffe6e9",
          200: "#ffcbd2",
          300: "#ffa1ad",
          400: "#ff6b7e",
          500: "#f53a57",
          600: "#d81f3f",
          700: "#b01633",
          800: "#8f152f",
          900: "#78132b"
        },
        saffron: {
          50: "#fff9ed",
          100: "#fff0d0",
          200: "#ffdda1",
          300: "#ffc26a",
          400: "#ffa63c",
          500: "#ff8a1a",
          600: "#e96d07",
          700: "#c15208",
          800: "#9a400e",
          900: "#7c340f"
        },
        cream: "#fffaf3"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Arial"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;