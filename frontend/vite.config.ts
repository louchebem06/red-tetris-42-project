import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import istanbul from 'vite-plugin-istanbul';

const config: UserConfig = {
	plugins: [
		sveltekit(),
		istanbul({
			include: 'src/*',
			exclude: ['node_modules', 'tests/', 'src/lib/game/*'],
			extension: ['.ts', '.svelte'],
			requireEnv: false,
			forceBuildInstrument: true,
		}),
	],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
				@use '$lib/scss/variables' as *;    
				@use '$lib/scss/mixins' as *;
			`,
			},
		},
	},
	build: {
		sourcemap: true,
	},
	server: {
		host: true,
	},
};

export default config;
