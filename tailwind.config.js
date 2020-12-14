const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      'sans': ["Roboto","ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      'serif': ["Lobster", "cursive", "Noto Serif", "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
    },
    extend: {
      colors: {
        iansblue: {
          light: '#2990EA',
          dark: '#003366'
        },
        'light-blue': colors.lightBlue,
        cyan: colors.cyan,
      },
      textColor: {
        iansgrey: {
          dark: '#333333'
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  // plugins: [require('@tailwindcss/typography')],
  plugins: [],
}
