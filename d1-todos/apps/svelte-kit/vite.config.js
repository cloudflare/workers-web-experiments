import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			entryFileNames: fileInfo => {
				console.log(`\x1b[31m ${JSON.stringify({fileInfo})} \x1b[0m`);
				
				// This is checked separately as deepStrictEqual is having some issues
				return 'chunk-[name]-[hash]-[format].js';
		},
	  },
	}
};

export default config;
