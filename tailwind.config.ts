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
        background: "#FAFAF7",
        foreground: "#0A0A0A",
        muted: "#525252",
        border: "#E5E5E5",
        accent: {
          DEFAULT: "#0E7C7B",
          light: "#0E7C7B10",
        },
        status: {
          paid: "#16A34A",
          "paid-bg": "#DCFCE7",
          pending: "#525252",
          "pending-bg": "#F5F5F5",
          overdue: "#DC2626",
          "overdue-bg": "#FEE2E2",
          draft: "#B45309",
          "draft-bg": "#FEF3C7",
        },
      },
      fontFamily: {
        arabic: ["var(--font-ibm-plex-arabic)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        badge: "999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
      },
      lineHeight: {
        arabic: "1.75",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
