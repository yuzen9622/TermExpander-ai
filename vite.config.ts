import { defineConfig } from "vite";
import path from "path";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "index.html"),
        background: path.resolve(__dirname, "src/extension/background.ts"),
        content: path.resolve(__dirname, "src/extension/content.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "content") return "content.js";
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
});
