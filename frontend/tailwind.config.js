/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          background: "#f8fafc",
          surface: "#ffffff",
          surfaceHover: "#f1f5f9",
          border: "#e2e8f0",
          text: "#0f172a",
          textSecondary: "#64748b",
          primary: "#6366f1",
          secondary: "#a855f7",
          accent: "#22d3ee",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#3b82f6",
        },
        // Dark mode colors
        dark: {
          background: "#0f172a",
          surface: "#1e293b",
          surfaceHover: "#334155",
          border: "#334155",
          text: "#f8fafc",
          textSecondary: "#94a3b8",
          primary: "#818cf8",
          secondary: "#c084fc",
          accent: "#34d399",
          success: "#4ade80",
          warning: "#fbbf24",
          danger: "#f87171",
          info: "#60a5fa",
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.3)",
        glowAccent: "0 0 20px rgba(34, 211, 238, 0.3)",
        glowSuccess: "0 0 20px rgba(16, 185, 129, 0.3)",
        glowWarning: "0 0 20px rgba(245, 158, 11, 0.3)",
        glowDanger: "0 0 20px rgba(239, 68, 68, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [],
} 