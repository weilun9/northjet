import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1B6BF5',
          dark: '#0F4CBF',
          light: '#EEF4FF',
        },
        navy: {
          DEFAULT: '#0B1835',
          light: '#1C3461',
        },
        sky: '#E8F0FF',
        accent: '#00C896',
      },
      boxShadow: {
        card: '0 2px 16px rgba(27, 107, 245, 0.08)',
        'card-hover': '0 8px 32px rgba(27, 107, 245, 0.16)',
      },
    },
  },
  plugins: [],
};
export default config;
