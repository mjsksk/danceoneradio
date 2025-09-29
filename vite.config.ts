import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Cache busting plugin
    {
      name: 'cache-busting',
      transformIndexHtml(html: string) {
        return html.replace('__BUILD_TIMESTAMP__', Date.now().toString());
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Add timestamp to entry chunks for cache busting
        entryFileNames: (chunkInfo) => {
          return `assets/${chunkInfo.name}-${Date.now()}.[hash].js`;
        }
      }
    }
  }
}));
