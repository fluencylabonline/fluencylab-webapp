import type { Config } from "tailwindcss";

// Define your fluency color pattern
const fluencyColors = {
  "fluency-bg": {
    dark: "#282828",
    light: "#F5F5F5",
  },
  "fluency-pages": {
    dark: "#121212",
    light: "#E3E7E8",
  },
  "fluency-text": {
    dark: "#FAFAFA",
    light: "#013A49",
  },
  "fluency-blue": {
    50: "#EDFCFE",
    100: "#DBE8EC",
    200: "#C0E5F0",
    300: "#8BD4E8",
    400: "#65C6E0",
    500: "#21B5DE",
    600: "#149DC6",
    700: "#147EA6",
    800: "#176687",
    900: "#1B546F",
    950: "#1B465E",
    1000: "#0C2D40",
    1100: "#001E26",
  },
  "fluency-yellow": {
    100: "#F0E8C0",
    200: "#F5F3E9",
    300: "#E8D98B",
    400: "#E0C84F",
    500: "#DEBE16",
    600: "#D4B20B",
    700: "#AD9311",
    800: "#544703",
    900: "#262000",
  },
  "fluency-green": {
    50: "#f0fdf3",
    100: "#dbfde4",
    200: "#baf8cb",
    300: "#84f1a3",
    400: "#48e072",
    500: "#1fc84f",
    600: "#15b041",
    700: "#138234",
    800: "#15662d",
    900: "#135427",
    950: "#042f12",
  },
  "fluency-red": {
    100: "#F5EAE9",
    200: "#F0C4C0",
    300: "#E8938B",
    400: "#E06F65",
    500: "#FA3D2E",
    600: "#CC2718",
    700: "#99180C",
    800: "#800F05",
    900: "#660800",
  },
  "fluency-orange": {
    100: "#F0D0C0",
    200: "#F5EDE9",
    300: "#E8AA8B",
    400: "#E08E65",
    500: "#DE5916",
    600: "#BF4A0F",
    700: "#993808",
    800: "#541E03",
    900: "#260D00",
  },
  "fluency-gray": {
    50: "#FAFAFA",
    100: "#EAEAEA",
    200: "#B3BBBD",
    300: "#7D898C",
    400: "#4C585C",
    500: "#232B2E",
    600: "#171F21",
    700: "#0C1214",
    800: "#05090A",
    900: "#010303",
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
  plugins: [],
};

export default config;
