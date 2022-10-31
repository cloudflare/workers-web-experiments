import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

export default () => {
	return {
		ssr: { target: "webworker", noExternal: true },
		// build: { minify: false, sourcemap: true },
		// esbuild: {
		// 		minifySyntax: false,
		// 		minifyIdentifiers: false,
		// 		minifyWhitespace: false,
		// },
		// plugins: [qwikVite({ debug: true }), tsconfigPaths()],
		plugins: [qwikVite(), tsconfigPaths()],
	};
};
