// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',  // Enables dark: prefix in CSS
  theme: {
    extend: {
      // Match your theme's colors (extend as needed)
      colors: {
        'primary-blue': '#3B82F6',  // Blue accents
        'accent-purple': '#8B5CF6', // Purple gradients
        // Add more from your docs if needed
      },
    },
  },
  plugins: [],
}