import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          tone: ['tone'],
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
      "@components": "/src/Components",
      "@shared": "/src/Components/SharedComponents",
      "@EarTrainers": "/src/Components/EarTrainers",
      "@ChordTrainer": "/src/Components/ChordTrainer",
      "@utils": "/src/utils",
      "@assets": "/src/assets",
      "@themes": "/src/themes",
      "@hooks": "/src/hooks",
      "@ui": "/src/Components/UI",
      "@styles": "/src/styles",
      // Add more aliases as needed
    },
  },
});
