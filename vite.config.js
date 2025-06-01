import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from 'rollup-plugin-visualizer';
import checker from 'vite-plugin-checker'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), checker({ typescript: true })],
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          tone: ['tone', 'tonal'],
          i18n: ['i18next', 'react-i18next'],
          motion: ['motion']
        }
      },
      plugins: [
        visualizer({
          open: true, // 打包完成后自动打开图表
          filename: 'stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      "@EarTrainers": "/src/pages/EarTrainers",
      "@ChordTrainer": "/src/pages/ChordTrainer",
      "@components": "/src/Components",
      "@shared": "/src/Components/SharedComponents",
      "@utils": "/src/utils",
      "@assets": "/src/assets",
      "@themes": "/src/themes",
      "@hooks": "/src/hooks",
      "@ui": "/src/Components/UI",
      "@styles": "/src/styles",
      "@stores": "/src/stores"
      // Add more aliases as needed
    },
  },
});
