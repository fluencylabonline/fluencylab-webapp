import type { Config } from "tailwindcss";

// Define your fluency color pattern
const fluencyColors = {
  "fluency-bg": {
    dark: "#24313A",
    light: "#ede4f0",
  },
  "fluency-pages": {
    dark: "#070F14",
    light: "#d5cfe6",
  },
  "fluency-text": {
    dark: "#FDF4DC",
    light: "#0A0226",
  },
  "tiptap-page": {
    dark: "#050A0E",
    light: "#f5f5f5", // Maybe FDF4DC is better
  },
  "fluency-blue": {
    50: "#f0f1fd",
    100: "#d7d9f9",
    200: "#aeb3f3",
    300: "#818cea",
    400: "#3F51B5",
    500: "#303F9F",
    600: "#1A237E", // base
    700: "#151c65",
    800: "#10154c",
    900: "#0a0f36",
    950: "#05071f",
  },
  "fluency-orange": {
    50: "#fff8f0",
    100: "#FFECB3",
    200: "#FFE082",
    300: "#FFD54F",
    400: "#FFCA28",
    500: "#FFC107",
    600: "#FFB300",
    700: "#FFA000",
    800: "#FF8F00",
    900: "#FF6F00",
    950: "#A64E00",
  },
  "fluency-red": {
    50: "#fff5f2",
    100: "#fcdedb",
    200: "#f8b7ae",
    300: "#f18280",
    400: "#eb4f4a",
    500: "#e22823",
    600: "#CE2305", // base
    700: "#a01b04",
    800: "#7b1303",
    900: "#580d02",
    950: "#2f0601",
  },
  "fluency-gray": {
    50: "#f3f6f7",
    100: "#d6dfe2",
    200: "#a8b9c2",
    300: "#7c98a4",
    400: "#4e6f80",
    500: "#2e515f",
    600: "#243841", // base
    700: "#1b2a33",
    800: "#131e25",
    900: "#0c151a",
    950: "#050a0e",
  },
  "fluency-green": {
    50: "#f0fdf3",
    100: "#d9fae5",
    200: "#6CCE9D",
    300: "#45BD81",
    400: "#00B75B",
    500: "#169254",
    600: "#046139", // base
    700: "#044f30",
    800: "#033d26",
    900: "#022e1d",
    950: "#011f13",
  },
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Spread the fluencyColors pattern into your Tailwind colors
      colors: {
        ...fluencyColors,
      },
      animation: {
        "audio-wave": "audio-wave 1.2s ease infinite",
      },
      keyframes: {
        "audio-wave": {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
