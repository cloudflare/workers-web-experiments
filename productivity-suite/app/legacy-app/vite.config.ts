import { defineConfig, HtmlTagDescriptor, PluginOption } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), addCloudflareAnalyticsScript()],
  server: {
    cors: true,
    port: 8585,
    strictPort: true,
    hmr: {
      clientPort: 8585,
    },
  },
});

export function addCloudflareAnalyticsScript(): PluginOption {
  return {
    name: "add-cloudflare-analytics-script",
    apply: "build",
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        {
          tag: "script",
          attrs: {
            defer: true,
            src: "https://static.cloudflareinsights.com/beacon.min.js",
            "data-cf-beacon": "{'token': '43a08321febf43fe9103890be2f3bb5f'}",
          },
        },
      ];
      return tags;
    },
  };
}
