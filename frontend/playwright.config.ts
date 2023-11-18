import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: [
		{
			command: 'npm run start -C ../backend',
			port: 8080,
		},
		{
			command: 'npm run preview',
			port: 4173,
		},
	],
	use: {
		baseURL: 'http://localhost:4173',
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
};

export default config;
