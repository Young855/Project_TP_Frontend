import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { presetWind } from 'unocss'

export default defineConfig({
  plugins: [
    react(),
    UnoCSS({
      presets: [presetWind()],
    }),
  ],
})
