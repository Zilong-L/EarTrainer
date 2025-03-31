import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteImagemin from 'vite-plugin-imagemin';
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
        viteImagemin({
          gifsicle: {
            optimizationLevel: 7,
            interlaced: false,
          },
          optipng: {
            optimizationLevel: 7,
          },
          mozjpeg: {
            quality: 75,
          },
          pngquant: {
            quality: [0.65, 0.9],
            speed: 4,
          },
          svgo: {
            plugins: [
              { name: 'removeViewBox' },
              { name: 'removeEmptyAttrs', active: false },
            ],
          },
          webp: {
            quality: 75,
          },
        }),
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
