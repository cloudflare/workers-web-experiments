import solid from "solid-start/vite";
import cloudflareWorkers from "solid-start-cloudflare-workers";
import { defineConfig, PluginOption } from "vite";

// mount(() => createComponent(StartClient, {}), document);

export function addDefaultFnExportToBundle(regex: RegExp): PluginOption {
  return {
    name: "add-default-fn-export-to-bundle-plugin",
    enforce: "post",
    generateBundle(_options, chunkMap) {
      for (const file of Object.keys(chunkMap)) {
        if (regex.test(file)) {
          const jsChunk = chunkMap[file] as { code: string; isEntry: boolean };
          if (jsChunk.isEntry) {
            jsChunk.code = jsChunk.code.replace(
              "mount(() => createComponent(StartClient, {}), document);",
              `
              const moduleFn = () => {
                mount(() => createComponent(StartClient, {}), document);
              };
              moduleFn();
              export default moduleFn;
            `
            );
          }
        }
      }
    },
  };
}

export default defineConfig({
  // base: "/_fragment/news",
  ssr: {
    // Vite attempts to load this as a Commonjs dependency
    noExternal: ["solid-meta"],
  },
  // build: {
  //   minify: false,
  //   rollupOptions: {
  //     external: ["__STATIC_CONTENT_MANIFEST"],
  //   },
  // },
  plugins: [
    solid({
      ssr: true,
      adapter: cloudflareWorkers({}),
    }),
    addDefaultFnExportToBundle(/entry-client\..*\.js$/),
  ],
});
