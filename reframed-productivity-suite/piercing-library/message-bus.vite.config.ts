import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, `src/message-bus/inline-script.ts`),
      formats: ["es"],
      fileName: "message-bus-inline-script",
    },
  },
});
