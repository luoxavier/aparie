import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const animations = {
  keyframes: {
    "card-flip": {
      "0%": { transform: "rotateY(0deg)" },
      "100%": { transform: "rotateY(180deg)" },
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
        opacity: "0.5"
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
    "accordion-down": {
      from: { height: "0" },
      to: { height: "var(--radix-accordion-content-height)" }
    },
    "accordion-up": {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: "0" }
    }
  },
  animation: {
    "card-flip": "card-flip 0.6s ease-in-out",
    "slide-up": "slide-up 0.3s ease-out",
    "sparkle": "sparkle 0.7s ease-in-out forwards",
    "glow-red": "glow-red 0.7s ease-in-out",
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out"
  },
};

const themeColors = {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
};

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: themeColors,
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      ...animations,
      fontFamily: {
        sans: ["Quicksand", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
