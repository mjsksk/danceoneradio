import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { generatePrerenderFiles } from "./scripts/generate-prerender";

function seoPrerenderPlugin() {
  return {
    name: "seo-prerender-after-build",
    apply: "build" as const,
    closeBundle() {
      // Generates dist/<route>/index.html files with correct meta tags.
      generatePrerenderFiles();
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    seoPrerenderPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
  },
}));
