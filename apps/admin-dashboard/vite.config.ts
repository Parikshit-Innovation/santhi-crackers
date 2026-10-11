import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@repo/crackers": path.resolve(import.meta.dirname, "../../packages/crackers"),
      "@crackers": path.resolve(import.meta.dirname, "../../packages/crackers"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5001,

    allowedHosts: ["untolerative-len-rumblingly.ngrok-free.dev"],

    proxy: {
      "/api": {
        target: "http://localhost:3007",
        changeOrigin: true,
      },
    },

    hmr: {
      protocol: "wss",
      host: "untolerative-len-rumblingly.ngrok-free.dev",
      clientPort: 443,
    },
  },
});
