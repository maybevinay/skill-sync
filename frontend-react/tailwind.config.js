/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--ss-bg) / <alpha-value>)",
        foreground: "rgb(var(--ss-fg) / <alpha-value>)",
        surface: "rgb(var(--ss-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--ss-surface-2) / <alpha-value>)",
        muted: "rgb(var(--ss-muted) / <alpha-value>)",
        "muted-2": "rgb(var(--ss-muted-2) / <alpha-value>)",
        line: "rgb(var(--ss-border) / <alpha-value>)",
        primary: "rgb(var(--ss-primary) / <alpha-value>)",
        secondary: "rgb(var(--ss-secondary) / <alpha-value>)",
        accent: "rgb(var(--ss-accent) / <alpha-value>)",
        success: "rgb(var(--ss-success) / <alpha-value>)",
        warning: "rgb(var(--ss-warning) / <alpha-value>)",
        danger: "rgb(var(--ss-danger) / <alpha-value>)",
        ring: "rgb(var(--ss-ring) / <alpha-value>)",
        lavender: "rgb(var(--ss-soft-lavender) / <alpha-value>)",
        "soft-blue": "rgb(var(--ss-soft-blue) / <alpha-value>)",
        mint: "rgb(var(--ss-soft-mint) / <alpha-value>)",
        "soft-yellow": "rgb(var(--ss-soft-yellow) / <alpha-value>)",
        rose: "rgb(var(--ss-soft-rose) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glass: "0 1px 2px rgb(17 25 54 / 0.04), 0 8px 24px rgb(17 25 54 / 0.04)",
        card: "0 1px 2px rgb(17 25 54 / 0.04), 0 10px 28px rgb(17 25 54 / 0.05)",
        lift: "0 10px 24px rgb(91 76 246 / 0.16)",
      },
      borderRadius: {
        ss: "1rem",
      },
      maxWidth: {
        app: "88rem",
      },
    },
  },
  plugins: [],
};
