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
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5001,

    allowedHosts: ["untolerative-len-rumblingly.ngrok-free.dev"],

    hmr: {
      protocol: "wss",
      host: "untolerative-len-rumblingly.ngrok-free.dev",
      clientPort: 443,
    },
  },
});
