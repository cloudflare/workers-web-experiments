import { PluginOption } from "vite";

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
