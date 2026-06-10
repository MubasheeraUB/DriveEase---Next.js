/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: "#2563EB", hover: "#1D4ED8" },
        secondary:  "#10B981",
        accent:     "#F59E0B",
        background: "#F8FAFC",
        card:       "#FFFFFF",
        sidebar:    "#FFFFFF",
        "text-primary":   "#0F172A",
        "text-secondary": "#64748B",
        border:     "#E2E8F0",
        success:    "#22C55E",
        warning:    "#F59E0B",
        danger:     "#EF4444",
        "sidebar-hover": "#DBEAFE",
      },
    },
  },
  plugins: [],
};
