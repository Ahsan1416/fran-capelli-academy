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
        fca: {
          green: {
            DEFAULT: "#00512C",
            dark: "#00381e",
            light: "#006d3b",
            subtle: "#e8f5ee"
          },
          mint: {
            DEFAULT: "#14C88C",
            light: "#a7f3d0",
            dark: "#0f9668"
          },
          gold: {
            DEFAULT: "#C5A059",
            light: "#E5C887",
            dark: "#9E7B3A"
          },
          navy: {
            DEFAULT: "#0F172A",
            dark: "#080C15"
          }
        }
      }
    },
  },
  plugins: [],
};
export default config;

