import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";

export default defineConfig(() => ({
	build: {
		target: "es2020",
		lib: {
			entry: "src/index.tsx",
			formats: ["cjs", "es"],
			fileName: (format) => `index.qwik.${format === "es" ? "mjs" : "cjs"}`,
		},
		rollupOptions: {
			external: ["cookie"],
		},
	},
	plugins: [qwikVite()],
}));
