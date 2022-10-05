import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "",
  envDir: "src/envs",
  ssr: { target: "webworker", noExternal: true },
  plugins: [react()],
  build: {
    outDir: "dist/server",
    rollupOptions: {
      external: ["__STATIC_CONTENT_MANIFEST"],
    },
  },
});
