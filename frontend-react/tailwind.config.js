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
        muted: "rgb(var(--ss-muted) / <alpha-value>)",
        line: "rgb(var(--ss-border) / <alpha-value>)",
        primary: "rgb(var(--ss-primary) / <alpha-value>)",
        secondary: "rgb(var(--ss-secondary) / <alpha-value>)",
        accent: "rgb(var(--ss-accent) / <alpha-value>)",
        success: "rgb(var(--ss-success) / <alpha-value>)",
        warning: "rgb(var(--ss-warning) / <alpha-value>)",
        danger: "rgb(var(--ss-danger) / <alpha-value>)",
        ring: "rgb(var(--ss-ring) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glass: "0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.08)",
        card: "0 1px 2px rgb(15 23 42 / 0.05), 0 10px 28px rgb(15 23 42 / 0.06)",
      },
      borderRadius: {
        ss: "0.75rem",
      },
      maxWidth: {
        app: "72rem",
      },
    },
  },
  plugins: [],
};
