// vite.config.js
console.log("✅ vite.config.js loaded");
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import { presetWind3 } from "@unocss/preset-wind3";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // ✅ FastAPI 주소 (없으면 네가 쓰던 값으로 기본 설정)
  const chatServer = env.VITE_CHAT_SERVER_URL || "http://localhost:8000";

  return {
    plugins: [
      react(),
      UnoCSS({
        presets: [presetWind3()],
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        // 프론트에서 /chat-api/chat 으로 호출하면
        // Vite가 http://192.168.0.3:8000/chat 으로 프록시
        "/chat-api": {
          target: chatServer,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/chat-api/, ""),
        },
      },
    },
  };
});
