import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    envDir: "src/envs",
    ssr: { target: "webworker", noExternal: true },
    plugins: [qwikVite(), tsconfigPaths()],
    build: {
      // minify: false,
      // sourcemap: "inline",
      // esbuild: {
      //   minifySyntax: false,
      //   minifyIdentifiers: false,
      //   minifyWhitespace: false,
      // },
      rollupOptions: {
        external: ["../../_shared/*.ts"],
      },
    },
  };
});
