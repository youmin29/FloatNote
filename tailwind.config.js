/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FFD6E0',
          lavender: '#E8D5F5',
          mint: '#C8F0E8',
          blue: '#C8E4F8',
          yellow: '#FFF3C4',
          peach: '#FFE5CC',
          cream: '#FFF8F0',
        },
        note: {
          pink: '#FF85A1',
          lavender: '#A78BCA',
          mint: '#5BBDA8',
          blue: '#4A9ECC',
          yellow: '#E8B84B',
          peach: '#E8855A',
        },
      },
      fontFamily: {
        retro: ['"VT323"', 'monospace'],
        soft: ['"Nunito"', 'sans-serif'],
      },
      boxShadow: {
        note: '4px 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
        'note-hover': '6px 8px 20px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1)',
        'note-pinned': '2px 2px 8px rgba(0,0,0,0.15), 0 0 0 2px rgba(255,133,161,0.4)',
      },
      animation: {
        'pop-in': 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'pop-out': 'popOut 0.2s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards',
        'check': 'checkSnap 0.15s ease-out',
        'bounce-pin': 'bouncePin 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'strike': 'strikeThrough 0.3s ease-out forwards',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.7) rotate(-2deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        popOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.6) rotate(3deg)', opacity: '0' },
        },
        checkSnap: {
          '0%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        bouncePin: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.3) rotate(-10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        strikeThrough: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}
