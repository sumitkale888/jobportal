/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "#0f172a",
          card: "#1e293b",
          text: {
            primary: "#e2e8f0",
            secondary: "#94a3b8",
          },
          accent: "#6366f1",
          accentAlt: "#8b5cf6",
        },
      },
    },
  },
  plugins: [],
}

