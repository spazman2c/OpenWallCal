import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f8f1e7',
        ink: '#1f2933',
        clay: '#d97745',
        sage: '#8fa58a',
        tide: '#3f7f8f',
        butter: '#f4c95d'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia']
      },
      boxShadow: {
        card: '0 18px 50px rgba(56, 42, 28, 0.10)'
      }
    }
  },
  plugins: []
};
export default config;
