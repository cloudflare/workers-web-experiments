import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { addDefaultFnExportToBundle } from "shared";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "src/envs",
  base: "/_fragment/todos/",
  plugins: [react(), addDefaultFnExportToBundle(/index\..*\.js$/)],
  build: {
    outDir: "dist/client/_fragment/todos/",
    rollupOptions: {
      input: "index.html",
    },
  },
});
