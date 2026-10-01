// Restate scales in rem on a 10px root so sizes stay pixel-identical (p-3 = 1.2rem = 12px).
const pxToRem = (px) => `${px / 10}rem`;

// Tailwind's default spacing scale in px, restated for the 10px root.
const SPACING_PX = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

const spacing = Object.fromEntries(
  Object.entries(SPACING_PX).map(([key, px]) => [key, px === 0 ? '0px' : pxToRem(px)]),
);

module.exports = {
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/layouts/**/*.tsx',
    './src/loading.tsx',
  ],
  safelist: ['animate-pulse'],
  theme: {
    extend: {
      spacing,
      borderRadius: {
        none: '0px',
        sm: pxToRem(2),
        DEFAULT: pxToRem(4),
        default: pxToRem(4),
        md: pxToRem(6),
        lg: pxToRem(8),
        xl: pxToRem(12),
        '2xl': pxToRem(16),
        '3xl': pxToRem(24),
        full: '9999px',
      },
      fontFamily: {
        sans: [
          'Be Vietnam Pro',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        serif: ['ui-serif'],
      },
      keyframes: {
        fade: {
          '0%': {
            transform: 'translate(-100%, -150%) skew(45deg)',
          },
          '50%': { transform: 'translate(-50%, -50%) skew(45deg)' },
          '100%': {
            transform: 'translate(0%, 50%) skew(45deg)',
          },
        },
        gradient: {
          '0%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
          '100%': {
            'background-position': '0% 50%',
          },
        },
        flicker: {
          '0%, 100%': {
            transform: 'rotate(-45deg) translate(0, 0)',
          },
          '50%': {
            transform: 'rotate(-45deg) translate(4px, 4px)',
          },
        },
        frameAnimation: {
          '0%': {
            'background-position': '0 0',
          },
          '100%': {
            'background-position': '0 -3000%',
          },
        },
      },
      animation: {
        fade: 'fade 1s infinite',
        flicker: 'flicker 1s ease-in-out infinite',
        spriteAnimation: 'frameAnimation 0.5s steps(30) infinite forwards',
        gradient: 'gradient 7.5s ease-in-out infinite',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',

        // Teal colors
        'teal-1': '#6BB3B1',
        'teal-2': '#4EA09D',
        'teal-3': '#3B8D8A',
        'teal-4': '#286E6C',
        'teal-5': '#185C5A',
        'teal-6': '#124E4C',
        'teal-7': '#0F3C3A',

        // Neutral colors
        'neutral-1': '#FFFFFF',
        'neutral-2': '#F5F6FA',
        'neutral-3': '#EBECF0',
        'neutral-4': '#D4D5D9',
        'neutral-5': '#BBBCBF',
        'neutral-6': '#8A8B8C',
        'neutral-7': '#575859',
        'neutral-8': '#414142',
        'neutral-9': '#2A2A2B',
        'neutral-10': '#000D0B',

        // Success colors
        'success-1': '#E5F6E5',
        'success-2': '#C7EAC7',
        'success-3': '#8CD58C',
        'success-4': '#4CBD4C',
        'success-5': '#00A100',
        'success-6': '#008302',
        'success-7': '#006604',
        'success-8': '#005006',
        'success-9': '#003908',
        'success-10': '#002B09',

        // Error colors
        'error-1': '#FEE9EA',
        'error-2': '#FDCED1',
        'error-3': '#FB9CA0',
        'error-4': '#F8646C',
        'error-5': '#F5222D',
        'error-6': '#C91C25',
        'error-7': '#9A151C',
        'error-8': '#7B1117',
        'error-9': '#580C10',
        'error-10': '#42090C',
      },
      margin: {
        3.75: pxToRem(15),
      },
      width: {
        75: pxToRem(300),
      },
      fontSize: {
        sm: [pxToRem(14), pxToRem(20)],
        base: [pxToRem(16), pxToRem(24)],
        error: [pxToRem(12), pxToRem(20)],
        // Display
        'heading-1': [pxToRem(40), { lineHeight: pxToRem(48), fontWeight: '600' }],
        'heading-2': [pxToRem(34), { lineHeight: pxToRem(40), fontWeight: '600' }],
        'heading-3': [pxToRem(28), { lineHeight: pxToRem(36), fontWeight: '600' }],
        'heading-4': [pxToRem(24), { lineHeight: pxToRem(32), fontWeight: '600' }],
        'heading-5': [pxToRem(20), { lineHeight: pxToRem(28), fontWeight: '600' }],

        'body-1-semibold': [pxToRem(16), { lineHeight: pxToRem(24), fontWeight: '600' }],
        'body-1-medium': [pxToRem(16), { lineHeight: pxToRem(24), fontWeight: '500' }],
        'body-1-regular': [pxToRem(16), { lineHeight: pxToRem(24), fontWeight: '400' }],

        'body-2-semibold': [pxToRem(14), { lineHeight: pxToRem(22), fontWeight: '600' }],
        'body-2-medium': [pxToRem(14), { lineHeight: pxToRem(22), fontWeight: '500' }],
        'body-2-regular': [pxToRem(14), { lineHeight: pxToRem(22), fontWeight: '400' }],

        'body-3-semibold': [pxToRem(12), { lineHeight: pxToRem(20), fontWeight: '600' }],
        'body-3-medium': [pxToRem(12), { lineHeight: pxToRem(20), fontWeight: '500' }],
        'body-3-regular': [pxToRem(12), { lineHeight: pxToRem(20), fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
