import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(35, 33%, 96%)',
        card: '#ffffff',
        text: 'hsl(27, 10%, 16%)',
        muted: 'hsl(27, 8%, 43%)',
        border: 'hsl(30, 18%, 90%)',
        accent: 'hsl(248, 100%, 72%)',
      },
      borderRadius: {
        lg: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config

