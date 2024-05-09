import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode:"class",
  theme: {
    extend: {
      colors: {
        'fluency-blue-100': '#E4EDF0',
        'fluency-blue-200': '#C0E5F0',
        'fluency-blue-300': '#8BD4E8',
        'fluency-blue-400': '#65C6E0',
        'fluency-blue-500': '#21B5DE',
        'fluency-blue-600': '#158EB0',
        'fluency-blue-700': '#0A6882',
        'fluency-blue-800': '#044B5E',
        'fluency-blue-900': '#033947',
        'fluency-blue-1000': '#001E26',

        'fluency-yellow-100': '#F0E8C0',
        'fluency-yellow-200': '#F5F3E9',
        'fluency-yellow-300': '#E8D98B',
        'fluency-yellow-400': '#E0C84F',
        'fluency-yellow-500': '#DEBE16',
        'fluency-yellow-600': '#D4B20B',
        'fluency-yellow-700': '#AD9311',
        'fluency-yellow-800': '#544703',
        'fluency-yellow-900': '#262000',

        'fluency-green': {
                '50': '#f0fdf3',
                '100': '#dbfde4',
                '200': '#baf8cb',
                '300': '#84f1a3',
                '400': '#48e072',
                '500': '#1fc84f',
                '600': '#15b041',
                '700': '#138234',
                '800': '#15662d',
                '900': '#135427',
                '950': '#042f12',
            },

        'fluency-red-100': '#F5EAE9',
        'fluency-red-200': '#F0C4C0',
        'fluency-red-300': '#E8938B',
        'fluency-red-400': '#E06F65',
        'fluency-red-500': '#FA3D2E',
        'fluency-red-600': '#CC2718',
        'fluency-red-700': '#99180C',
        'fluency-red-800': '#800F05',
        'fluency-red-900': '#660800',

        'fluency-orange-100': '#F0D0C0',
        'fluency-orange-200': '#F5EDE9',
        'fluency-orange-300': '#E8AA8B',
        'fluency-orange-400': '#E08E65',
        'fluency-orange-500': '#DE5916',
        'fluency-orange-600': '#BF4A0F',
        'fluency-orange-700': '#993808',
        'fluency-orange-800': '#541E03',
        'fluency-orange-900': '#260D00',
        
        'fluency-gray-50': '#FAFAFA',
        'fluency-gray-100': '#EAEAEA',
        'fluency-gray-200': '#B3BBBD',
        'fluency-gray-300': '#7D898C',
        'fluency-gray-400': '#4C585C',
        'fluency-gray-500': '#232B2E',
        'fluency-gray-600': '#171F21',
        'fluency-gray-700': '#0C1214',
        'fluency-gray-800': '#05090A',
        'fluency-gray-900': '#010303',


        'fluency-bg-light': '#FFFFFF',
        'fluency-bg-dark': '#282828',
        'fluency-pages-light': '#E9F2F5',
        'fluency-pages-dark': '#121212',

        'fluency-text-light': '#034354', /*A LITTLE BIT DARKER THAN FLUENCY-BLUE-800*/
        'fluency-text-dark': '#FAFAFA', /*A LITTLE BIT LIGHET THAN FLUENCY-GRAY-100*/
      }
    },
  },
  plugins: [],
};
export default config;
