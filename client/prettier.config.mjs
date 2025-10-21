// prettier.config.js (lub prettier.config.mjs)

/** @type {import('prettier').Config} */
const config = {
  // Lista wtyczek - podajemy nazwy wtyczek jako stringi.
  // Prettier sam zajmie się ich załadowaniem.
  plugins: ['prettier-plugin-tailwindcss'], 

  // Twoje pozostałe opcje:
  tabWidth: 4,
  singleQuote: true,
  semi: true,
  // ... inne opcje
};

export default config;