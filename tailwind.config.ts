import type { Config } from "tailwindcss"

// Redesign (v2 / v3) brand colours are OKLCH channel triplets defined in
// globals.css, so every token supports Tailwind's `/alpha` modifier.
const oklch = (name: string) => `oklch(var(--${name}) / <alpha-value>)`

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
      fontFamily: {
        // --font-sans is Inter on the original site and Montserrat in the
        // redesign (see globals.css).
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-montserrat)"],
      },
      colors: {
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

        // Redesign palette — mirrors the app: black camera UI, white app
        // sheets, and the app's own functional accents.
        night: oklch("night"),
        carbon: oklch("carbon"),
        graphite: oklch("graphite"),
        smoke: oklch("smoke"),
        fog: oklch("fog"),
        snow: oklch("snow"),
        mist: oklch("mist"),
        line: oklch("line"),
        ash: oklch("ash"),
        ink: oklch("ink"),
        spotted: oklch("spotted"),
        alert: oklch("alert"),
        gold: oklch("gold"),
        silver: oklch("silver"),
        bronze: oklch("bronze"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        sheet: "2.5rem",
      },
      fontSize: {
        // Fluid display scale for the redesign (ratio ≥ 1.25 between steps)
        "display-xl": ["clamp(2.75rem, 1.35rem + 4.6vw, 5.75rem)", { lineHeight: "0.94", letterSpacing: "-0.035em" }],
        "display-l": ["clamp(2.25rem, 1.2rem + 3.6vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.032em" }],
        "display-m": ["clamp(1.75rem, 1.2rem + 1.9vw, 2.75rem)", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-s": ["clamp(1.375rem, 1.1rem + 0.9vw, 1.75rem)", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      zIndex: {
        raised: "10",
        sticky: "30",
        menu: "35",
        header: "40",
        // shadcn dialogs use z-50
        preloader: "60",
        switcher: "70",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        "ping-soft": {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 40s linear infinite",
        blink: "blink 1.2s ease-in-out infinite",
        "ping-soft": "ping-soft 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
