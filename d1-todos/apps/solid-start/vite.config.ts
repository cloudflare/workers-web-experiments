import solid from "solid-start/vite";
import { defineConfig } from "vite";
import pages from "solid-start-cloudflare-pages";

export default defineConfig({
  plugins: [
    solid({
      adapter: pages({
        d1Databases: ["__D1_BETA__D1_TODOS_DB"],
        d1Persist: true,
        liveReload: true,
      }),
    }),
  ],
});
