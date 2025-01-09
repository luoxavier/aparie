import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#9b87f5",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#7E69AB",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#33C3F0",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2D3748",
        },
      },
      keyframes: {
        "card-flip": {
          "0%, 100%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "sparkle": {
          "0%": { 
            boxShadow: "0 0 0 0 rgba(155, 135, 245, 0)",
            color: "#9b87f5",
            opacity: "1"
          },
          "50%": { 
            boxShadow: "0 0 20px 10px rgba(155, 135, 245, 0.5)",
            color: "#9b87f5",
            opacity: "1"
          },
          "100%": { 
            boxShadow: "0 0 0 0 rgba(155, 135, 245, 0)",
            color: "#9b87f5",
            opacity: "0"
          },
        },
        "glow-red": {
          "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
          "50%": { boxShadow: "0 0 20px 10px rgba(239, 68, 68, 0.5)" },
          "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
        },
      },
      animation: {
        "card-flip": "card-flip 0.6s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        "sparkle": "sparkle 0.7s ease-in-out",
        "glow-red": "glow-red 1s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;