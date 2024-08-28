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
      "@EarTrainers": "/src/Components/EarTrainers",
      "@utils": "/src/utils",
      "@assets": "/src/assets",
      "@themes": "/src/themes",
      "@hooks": "/src/hooks"

      // Add more aliases as needed
    },
  },
});
