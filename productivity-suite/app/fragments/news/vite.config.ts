import solid from "solid-start/vite";
import cloudflareWorkers from "solid-start-cloudflare-workers";
import { defineConfig } from "vite";
import { addDefaultFnExportToBundle } from "shared";

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
    addDefaultFnExportToBundle(/entry-client\..*\.js$/),
  ],
});
