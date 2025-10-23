// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // src 폴더 내의 모든 JS/JSX 파일을 스캔
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}