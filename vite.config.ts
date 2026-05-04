import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) {
            return "react";
          }
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
            return "data";
          }
          if (id.includes("node_modules/recharts")) {
            return "charts";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
