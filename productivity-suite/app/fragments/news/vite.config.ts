import solid from "solid-start/vite";
import cloudflareWorkers from "solid-start-cloudflare-workers";
import { defineConfig, PluginOption } from "vite";

function addDefaultFnExportToBundle(): PluginOption {
  return {
    name: "add-default-fn-export-to-bundle-plugin",
    enforce: "post",
    generateBundle(_options, chunkMap) {
      for (const file of Object.keys(chunkMap)) {
        if (/entry-client\..*\.js$/.test(file)) {
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

export default defineConfig({
  ssr: {
    // Vite attempts to load this as a Commonjs dependency
    noExternal: ["solid-meta"],
  },
  build: {
    minify: false,
  },
  plugins: [
    solid({
      ssr: true,
      adapter: cloudflareWorkers({}),
    }),
    addDefaultFnExportToBundle(),
  ],
});
