import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    // .tsx/.ts önce çözülsün (eski derlenmiş .js'ler asla paketlenmesin)
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  server: {
    host: true,
    port: 9009,
    strictPort: true,
    watch: { usePolling: true },
  },
});
