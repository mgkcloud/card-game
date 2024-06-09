module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css",
  ],
  theme: {
    extend: {
      colors: {},
      backgroundImage: {
        gradient: "linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)",
      },
      minHeight: {
        '4/5': '80vh',
        '3/4': '75vh',
        '65': '65vh',
      },
      animation: {
        opacity: "opacity 0.25s ease-in-out",
        appearFromRight: "appearFromRight 300ms ease-in-out",
        wiggle: "wiggle 1.5s ease-in-out infinite",
        popup: "popup 0.25s ease-in-out",
        shimmer: "shimmer 3s ease-out infinite alternate",
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'card-shuffle': 'shuffle 0.5s ease-in-out',
      },
      keyframes: {
        opacity: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        appearFromRight: {
          "0%": { opacity: 0.3, transform: "translate(15%, 0px);" },
          "100%": { opacity: 1, transform: "translate(0);" },
        },
        wiggle: {
          "0%, 20%, 80%, 100%": { transform: "rotate(0deg)" },
          "30%, 60%": { transform: "rotate(-2deg)" },
          "40%, 70%": { transform: "rotate(2deg)" },
          "45%": { transform: "rotate(-4deg)" },
          "55%": { transform: "rotate(4deg)" },
        },
        popup: {
          "0%": { transform: "scale(0.8)", opacity: 0.8 },
          "50%": { transform: "scale(1.1)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "0 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(-1px)' },
          '50%': { transform: 'translateY(2px)' },
        },
        shuffle: {
          '0%': { transform: 'translateX(0)', zIndex: 20 },
          '50%': { transform: 'translateX(-15px)', zIndex: 10 },
          '75%': { transform: 'translateX(15px)', zIndex: 10 },
          '100%': { transform: 'translateX(0)', zIndex: 10 },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animated'),
    require("daisyui"),
  ],
  daisyui: {
    themes: ["light"],
  },
};
