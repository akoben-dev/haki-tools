// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
  colors: {
    background: "#F5F5F5",   // page bg (near white)
    surface: "#FFFFFF",      // cards
    subtle: "#F0F0F0",       // subtle sections
    border: "#E0E0E0",
    foreground: "#111111",   // main text
    muted: "#6B6B6B",        // secondary text
    accent: "#9FE2BF",       // seafoam green
  },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      spacing: {
        section: "6rem",            // py-section on main sections
        "section-lg": "8rem",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(0,0,0,0.45)",
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
