// vite.config.ts
import solid from "file:///Users/jculveyhouse/cf-repos/workers-web-experiments/productivity-suite/app/fragments/news/node_modules/solid-start/vite/plugin.js";
import cloudflareWorkers from "file:///Users/jculveyhouse/cf-repos/workers-web-experiments/productivity-suite/app/fragments/news/node_modules/solid-start-cloudflare-workers/index.js";
import { defineConfig } from "file:///Users/jculveyhouse/cf-repos/workers-web-experiments/productivity-suite/app/fragments/news/node_modules/vite/dist/node/index.js";
function wrapAndExportMount(regex) {
  return {
    name: "add-default-fn-export-to-bundle-plugin",
    enforce: "post",
    generateBundle(_options, chunkMap) {
      for (const file of Object.keys(chunkMap)) {
        if (regex.test(file)) {
          const jsChunk = chunkMap[file];
          if (jsChunk.isEntry) {
            jsChunk.code = jsChunk.code.replace(
              `mount(() => createComponent(StartClient, {}), document);`,
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
    }
  };
}
var vite_config_default = defineConfig({
  base: "/_fragment/news",
  build: {
    minify: false
  },
  ssr: {
    noExternal: ["solid-meta"]
  },
  plugins: [
    solid({
      ssr: true,
      adapter: cloudflareWorkers({})
    }),
    wrapAndExportMount(/entry-client\..*\.js$/)
  ]
});
export {
  vite_config_default as default,
  wrapAndExportMount
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamN1bHZleWhvdXNlL2NmLXJlcG9zL3dvcmtlcnMtd2ViLWV4cGVyaW1lbnRzL3Byb2R1Y3Rpdml0eS1zdWl0ZS9hcHAvZnJhZ21lbnRzL25ld3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qY3VsdmV5aG91c2UvY2YtcmVwb3Mvd29ya2Vycy13ZWItZXhwZXJpbWVudHMvcHJvZHVjdGl2aXR5LXN1aXRlL2FwcC9mcmFnbWVudHMvbmV3cy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvamN1bHZleWhvdXNlL2NmLXJlcG9zL3dvcmtlcnMtd2ViLWV4cGVyaW1lbnRzL3Byb2R1Y3Rpdml0eS1zdWl0ZS9hcHAvZnJhZ21lbnRzL25ld3Mvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgc29saWQgZnJvbSBcInNvbGlkLXN0YXJ0L3ZpdGVcIjtcbmltcG9ydCBjbG91ZGZsYXJlV29ya2VycyBmcm9tIFwic29saWQtc3RhcnQtY2xvdWRmbGFyZS13b3JrZXJzXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbk9wdGlvbiB9IGZyb20gXCJ2aXRlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwQW5kRXhwb3J0TW91bnQocmVnZXg6IFJlZ0V4cCk6IFBsdWdpbk9wdGlvbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJhZGQtZGVmYXVsdC1mbi1leHBvcnQtdG8tYnVuZGxlLXBsdWdpblwiLFxuICAgIGVuZm9yY2U6IFwicG9zdFwiLFxuICAgIGdlbmVyYXRlQnVuZGxlKF9vcHRpb25zLCBjaHVua01hcCkge1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIE9iamVjdC5rZXlzKGNodW5rTWFwKSkge1xuICAgICAgICBpZiAocmVnZXgudGVzdChmaWxlKSkge1xuICAgICAgICAgIGNvbnN0IGpzQ2h1bmsgPSBjaHVua01hcFtmaWxlXSBhcyB7IGNvZGU6IHN0cmluZzsgaXNFbnRyeTogYm9vbGVhbiB9O1xuICAgICAgICAgIGlmIChqc0NodW5rLmlzRW50cnkpIHtcbiAgICAgICAgICAgIGpzQ2h1bmsuY29kZSA9IGpzQ2h1bmsuY29kZS5yZXBsYWNlKFxuICAgICAgICAgICAgICBgbW91bnQoKCkgPT4gY3JlYXRlQ29tcG9uZW50KFN0YXJ0Q2xpZW50LCB7fSksIGRvY3VtZW50KTtgLFxuICAgICAgICAgICAgICBgXG4gICAgICAgICAgICAgIGNvbnN0IG1vZHVsZUZuID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIG1vdW50KCgpID0+IGNyZWF0ZUNvbXBvbmVudChTdGFydENsaWVudCwge30pLCBkb2N1bWVudCk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIG1vZHVsZUZuKCk7XG4gICAgICAgICAgICAgIGV4cG9ydCBkZWZhdWx0IG1vZHVsZUZuO1xuICAgICAgICAgICAgYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiBcIi9fZnJhZ21lbnQvbmV3c1wiLFxuICBidWlsZDoge1xuICAgIG1pbmlmeTogZmFsc2UsXG4gIH0sXG4gIHNzcjoge1xuICAgIC8vIFZpdGUgYXR0ZW1wdHMgdG8gbG9hZCB0aGlzIGFzIGEgQ29tbW9uanMgZGVwZW5kZW5jeVxuICAgIG5vRXh0ZXJuYWw6IFtcInNvbGlkLW1ldGFcIl0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBzb2xpZCh7XG4gICAgICBzc3I6IHRydWUsXG4gICAgICBhZGFwdGVyOiBjbG91ZGZsYXJlV29ya2Vycyh7fSksXG4gICAgfSksXG4gICAgd3JhcEFuZEV4cG9ydE1vdW50KC9lbnRyeS1jbGllbnRcXC4uKlxcLmpzJC8pLFxuICBdLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdjLE9BQU8sV0FBVztBQUNsZCxPQUFPLHVCQUF1QjtBQUM5QixTQUFTLG9CQUFrQztBQUVwQyxTQUFTLG1CQUFtQixPQUE2QjtBQUM5RCxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxlQUFlLFVBQVUsVUFBVTtBQUNqQyxpQkFBVyxRQUFRLE9BQU8sS0FBSyxRQUFRLEdBQUc7QUFDeEMsWUFBSSxNQUFNLEtBQUssSUFBSSxHQUFHO0FBQ3BCLGdCQUFNLFVBQVUsU0FBUztBQUN6QixjQUFJLFFBQVEsU0FBUztBQUNuQixvQkFBUSxPQUFPLFFBQVEsS0FBSztBQUFBLGNBQzFCO0FBQUEsY0FDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBT0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUVILFlBQVksQ0FBQyxZQUFZO0FBQUEsRUFDM0I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLEtBQUs7QUFBQSxNQUNMLFNBQVMsa0JBQWtCLENBQUMsQ0FBQztBQUFBLElBQy9CLENBQUM7QUFBQSxJQUNELG1CQUFtQix1QkFBdUI7QUFBQSxFQUM1QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
