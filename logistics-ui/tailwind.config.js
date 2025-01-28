/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        plexmono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        neonGreen: "#39ff14",
      },
    },
  },
  plugins: [],
};
