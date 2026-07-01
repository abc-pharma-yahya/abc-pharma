import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-teal', 'bg-navy', 'bg-coral', 'bg-gold',
    'bg-teal/10', 'bg-navy/10', 'bg-coral/10', 'bg-gold/10',
    'bg-teal/20', 'bg-navy/20', 'bg-coral/20', 'bg-gold/20',
    'text-teal', 'text-navy', 'text-coral', 'text-gold',
    'border-teal', 'border-navy', 'border-coral', 'border-gold',
    'bg-teal/5', 'bg-navy/5', 'bg-coral/5', 'bg-gold/5',
    'hover:bg-teal', 'hover:bg-navy', 'hover:bg-coral', 'hover:bg-gold',
  ],
  theme: {
    extend: {
      colors: {
        teal: '#258D89',
        navy: '#153F66',
        coral: '#EB544E',
        gold: '#C9A227',
        bglight: '#f8fafc',
      },
      fontFamily: {
        heading: ['var(--font-tajawal)', 'Tajawal', 'sans-serif'],
        body: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
