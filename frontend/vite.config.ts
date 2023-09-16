import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { configDefaults, type UserConfig as VitestConfig } from 'vitest/config';

const config: UserConfig & { test: VitestConfig['test'] } = {
	plugins: [sveltekit()],
	test: {
		globals: true,
		environment: 'jsdom',
		includeSource: ['src/**/*.{js,ts,svelte}'],
		exclude: [...configDefaults.exclude, 'tests'],
	},
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
