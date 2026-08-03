import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Onix design tokens
        "onix-gold":        "var(--onix-gold)",
        "onix-gold-light":  "var(--onix-gold-light)",
        "onix-dark":        "var(--onix-dark)",
        "onix-surface":     "var(--onix-surface)",
        "onix-card":        "var(--onix-card)",
        "onix-border":      "var(--onix-border)",
        "onix-text":        "var(--onix-text)",
        "onix-muted":       "var(--onix-muted)",
        "onix-green":       "var(--onix-green)",
        "onix-amber":       "var(--onix-amber)",
        "onix-red":         "var(--onix-red)",
        "onix-blue":        "var(--onix-blue)",
      },
    },
  },
  plugins: [],
};
export default config;
