// prettier.config.js (or prettier.config.mjs)

/** @type {import('prettier').Config} */
const config = {
  // Plugin list — names as strings. Prettier loads them automatically.
  plugins: ['prettier-plugin-tailwindcss'],

  // Other options:
  tabWidth: 4,
  singleQuote: true,
  semi: true,
};

export default config;
