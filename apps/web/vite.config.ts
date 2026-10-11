import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@repo/crackers": path.resolve(__dirname, "../../packages/crackers"),
      "@crackers": path.resolve(__dirname, "../../packages/crackers"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3000,

    allowedHosts: ["untolerative-len-rumblingly.ngrok-free.dev"],

    hmr: {
      protocol: "wss",
      host: "untolerative-len-rumblingly.ngrok-free.dev",
      clientPort: 443,
    },

    proxy: {
      "/api": {
        target: "http://localhost:3007",
        changeOrigin: true,
      },
    },
  },
});
