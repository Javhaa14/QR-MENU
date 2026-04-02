import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-bg)",
        ink: "var(--color-text)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
      },
      borderRadius: {
        theme: "var(--radius)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        velvet: "0 18px 70px rgba(29, 20, 15, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
