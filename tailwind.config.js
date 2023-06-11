const { fontFamily, maxWidth } = require('tailwindcss/defaultTheme');

/**
 * TailwindCSS configuration
 * @type {import("tailwindcss").Config}
 */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', ...fontFamily.sans],
    },
    extend: {
      colors: {
        transparent: 'transparent',
        inherit: 'inherit',
      },
      width: { unset: 'unset' },
      minWidth: ({ theme }) => theme('width'),
      maxWidth: ({ theme }) => theme('width'),
      height: { unset: 'unset' },
      minHeight: ({ theme }) => theme('height'),
      maxHeight: ({ theme }) => theme('height'),
      borderRadius: {
        xs: '1px',
        sm: '2px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  variants: {
    extend: {},
  },
};
