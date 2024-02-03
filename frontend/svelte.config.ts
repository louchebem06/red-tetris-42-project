import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config: import('@sveltejs/kit').Config = {
	preprocess: vitePreprocess(),
	test: {
		include: ['src/tests/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true,
		}),
	},
};

export default config;
