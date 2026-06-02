module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      content: [
        './src/**/*.{html,ts}',
        './src/app/admin/pages/sedes/*.html'
      ]
    },
    autoprefixer: {},
  },
}