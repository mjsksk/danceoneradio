import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [
    react(),
    {
      name: "desktop-index-alias",
      closeBundle() {
        const outDir = path.resolve(__dirname, "desktop-dist");
        const desktopEntry = path.join(outDir, "desktop.html");
        const indexEntry = path.join(outDir, "index.html");

        if (fs.existsSync(desktopEntry)) {
          fs.copyFileSync(desktopEntry, indexEntry);
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "chrome120",
    outDir: "desktop-dist",
    emptyOutDir: true,
    minify: "esbuild",
    sourcemap: false,
    esbuild: {
      drop: ["console", "debugger"],
      legalComments: "none",
    },
    rollupOptions: {
      input: path.resolve(__dirname, "desktop.html"),
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@tanstack/react-query', '@supabase/supabase-js'],
          ui: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 8080,
  },
});
