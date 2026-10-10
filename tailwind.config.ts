import type { Config } from "tailwindcss";

/**
 * Дизайн-токены «Рудимента».
 * Светлая тёплая палитра: костяной фон, терракотовый акцент, тёмно-коричневый текст.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF8F3", // фон
        surface: "#FFFFFF", // карточки
        sand: {
          50: "#F6F1E7",
          100: "#EDE5D6",
          200: "#DFD3BC",
          300: "#C9B894",
        },
        ink: {
          DEFAULT: "#1F1B16", // основной текст
          soft: "#5C5347", // вторичный текст
          faint: "#8A8073", // подписи
        },
        clay: {
          DEFAULT: "#D97742", // акцент — терракота
          dark: "#B85E2E",
          light: "#F2A97B",
          wash: "#FBEEE3",
        },
        moss: {
          DEFAULT: "#6B8F5E", // успех / «совесть сработала»
          wash: "#EDF3E9",
        },
        amber: {
          DEFAULT: "#E0A438", // предупреждение / частичное совпадение
          wash: "#FBF3DF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31,27,22,0.04), 0 4px 16px rgba(31,27,22,0.06)",
        lift: "0 2px 4px rgba(31,27,22,0.05), 0 12px 32px rgba(31,27,22,0.10)",
        inset: "inset 0 0 0 1px rgba(31,27,22,0.06)",
      },
      transitionTimingFunction: {
        rudiment: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        blink: {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "94%, 98%": { transform: "scaleY(0.08)" },
        },
      },
      animation: {
        blink: "blink 4.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
