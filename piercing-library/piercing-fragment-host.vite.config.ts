import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
	build: {
		outDir: "dist",
		emptyOutDir: false,
		lib: {
			entry: path.resolve(
				__dirname,
				`src/piercing-fragment-host/inline-script.ts`
			),
			formats: ["es"],
			fileName: "piercing-fragment-host-inline-script",
		},
	},
});
