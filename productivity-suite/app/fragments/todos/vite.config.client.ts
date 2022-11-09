import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "src/envs",
  base: "/_fragment/todos/",
  plugins: [react(), addDefaultFnExportToBundle(/index\..*\.js$/)],
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: "index.html",
    },
  },
});

export function addDefaultFnExportToBundle(regex: RegExp): PluginOption {
  return {
    name: "add-default-fn-export-to-bundle-plugin",
    enforce: "post",
    generateBundle(_options, chunkMap) {
      for (const file of Object.keys(chunkMap)) {
        if (regex.test(file)) {
          const jsChunk = chunkMap[file] as { code: string; isEntry: boolean };
          if (jsChunk.isEntry) {
            jsChunk.code = `
              const moduleFn = () => {
                ${jsChunk.code}
              };
              moduleFn();
              export default moduleFn;`.replace(/\t+/g, " ");
          }
        }
      }
    },
  };
}
