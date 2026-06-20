import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@react-three/fiber",
      "react-reconciler",
      "react-reconciler/constants",
      "@react-three/drei",
      "lodash.pick",
      "use-sync-external-store",
      "use-sync-external-store/shim/with-selector.js"
    ],
    exclude: [
      "three",
      "zustand"
    ],
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
