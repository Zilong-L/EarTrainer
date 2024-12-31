import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
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
