/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        beatrice:
          "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        sans: "'Beatrice Deck Trial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
    },
  },
  plugins: [],
};
