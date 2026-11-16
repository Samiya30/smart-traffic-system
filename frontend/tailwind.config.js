/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        traffic: {
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          cyan: "#06B6D4",
          blue: "#3B82F6",
          dark: "#0F172A",
          darker: "#0B0F19",
          card: "rgba(17, 24, 39, 0.8)"
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'siren': 'siren 0.6s infinite alternate',
      },
      keyframes: {
        siren: {
          '0%': { boxShadow: '0 0 15px 5px rgba(239, 68, 68, 0.8)' },
          '100%': { boxShadow: '0 0 25px 10px rgba(59, 130, 246, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
