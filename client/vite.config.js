import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",   // iPad/타 기기에서 접속 가능
    port: 5173,
    strictPort: true,
    proxy: {
      "/api":   { target: "http://127.0.0.1:5050", changeOrigin: true },
      "/files": { target: "http://127.0.0.1:5050", changeOrigin: true },
    },
  },
});
