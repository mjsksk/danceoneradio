import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "desktop-shell"),
  base: "./",
  publicDir: false,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "chrome120",
    outDir: path.resolve(__dirname, "src-tauri/desktop-dist"),
    emptyOutDir: true,
    minify: "esbuild",
    sourcemap: false,
    esbuild: {
      drop: ["console", "debugger"],
      legalComments: "none",
    },
    rollupOptions: {
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
