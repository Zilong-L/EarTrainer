import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/ChordTrainer',
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@components": "/src/Components",
      "@utils": "/src/utils",
      "@assets": "/src/assets",
      // Add more aliases as needed
    },
  },
});
