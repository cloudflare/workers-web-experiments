import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";

function addDefaultFnExportToBundle(): PluginOption {
  return {
    name: "add-default-fn-export-to-bundle-plugin",
    enforce: "post",
    generateBundle(_options, chunkMap) {
      for (const file of Object.keys(chunkMap)) {
        if (/index\..*\.js$/.test(file)) {
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

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "src/envs",
  base: "/_fragment/todos/",
  plugins: [react(), addDefaultFnExportToBundle()],
  build: {
    outDir: "dist/client/_fragment/todos/",
    rollupOptions: {
      input: "index.html",
    },
  },
});
