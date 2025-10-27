import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
// [수정됨] 'unocss'가 아니라 '@unocss/preset-wind'에서 가져와야 합니다.
// [수정됨] presetWind가 deprecated되었으므로 presetWind3로 변경합니다.
import { presetWind3 } from '@unocss/preset-wind3'

export default defineConfig({
  plugins: [
    react(),
    UnoCSS({
      presets: [presetWind3()], // [수정됨] presetWind() -> presetWind3()
    }),
  ],
})

