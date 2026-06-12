import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e8257a',
          pink: '#e8257a',
          navy: '#1a3a8a',
          yellow: '#ffd600',
        },
        section: {
          batting: '#ea580c',
          bowling: '#7c3aed',
          fielding: '#d97706',
        },
        format: {
          test: '#78350f',
          odi: '#1d4ed8',
          t20i: '#be185d',
        },
        // Legacy retro palette — still referenced by globals.css effects
        gold: '#f4a261',
        pitch: '#2d6a4f',
        cream: '#fdf8f0',
        // Card surface palette (native card design colors)
        parchment: '#fdf8ef',
        night: '#0a0f1e',
        'card-border': '#d1c9b8',
      },
      spacing: {
        nav: '60px',
      },
      fontFamily: {
        display: ['var(--font-sour-gummy)', 'sans-serif'],
        body: ['var(--font-inconsolata)', 'monospace'],
        bangers: ['var(--font-bangers)', 'cursive'],
        barlow: ['var(--font-barlow)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'retro-grain':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

export default config
