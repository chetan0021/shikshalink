import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia"]
      },
      colors: {
        sl: {
          primary: "var(--sl-primary)",
          secondary: "var(--sl-secondary)",
          accent: "var(--sl-accent)",
          dark: "var(--sl-bg-dark)",
          light: "var(--sl-bg-light)",
          text: "var(--sl-text)",
          "text-light": "var(--sl-text-light)",
          surface: "var(--sl-surface)"
        }
      },
      borderRadius: {
        xl: "12px",
        lg: "10px",
        md: "8px"
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 1px color-mix(in srgb, var(--sl-primary) 35%, transparent), 0 0 18px var(--sl-glow), 0 0 28px var(--sl-glow-aqua)"
          },
          "50%": {
            boxShadow:
              "0 0 0 1px color-mix(in srgb, var(--sl-primary) 45%, transparent), 0 0 24px var(--sl-glow), 0 0 40px var(--sl-glow-aqua)"
          }
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
