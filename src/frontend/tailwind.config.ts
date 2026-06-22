import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          "50":  "#EEF2FF",
          "100": "#E0E7FF",
          "200": "#C7D2FE",
          "300": "#A5B4FC",
          "400": "#818CF8",
          "500": "#6366F1",
          "600": "#4F46E5",
          "700": "#4338CA",
          "800": "#3730A3",
          "900": "#312E81",
        },
      },
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        elevated: "0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)",
        focused: "0 0 0 3px rgba(99,102,241,0.2)",
      },
      borderRadius: {
        card: "12px",
        modal: "16px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
