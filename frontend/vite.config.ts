import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
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
};

export default config;
