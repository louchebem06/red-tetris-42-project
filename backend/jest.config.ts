import type { Config } from 'jest';

const config: Config = {
	verbose: true,
	forceExit: true,
	collectCoverage: true,
	collectCoverageFrom: [
		'<rootDir>/src/*.ts',
		'<rootDir>/src/**/*.ts',
		'<rootDir>/src/**/**/*.ts',
		'<rootDir>/src/**/**/**/*.ts',
	],
	coverageDirectory: '<rootDir>/src/tests/coverage-reports/',
	coveragePathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/dist/',
		'<rootDir>/src/docs/',
		'<rootDir>/src/tests/',
		'<rootDir>/src/tests/coverage-reports/',
		'<rootDir>/src/infra/io/sessions/types/',
		'<rootDir>/src/players/types.ts',
		'<rootDir>/src/rooms/types.ts',
	],
	coverageThreshold: {
		global: {
			branches: 50, // 50
			functions: 70, // 70
			lines: 70, // 70
			statements: 70, // 70
		},
	},
	reporters: ['default', ['github-actions', { silent: false }], 'summary'],
	displayName: {
		name: 'RED-TETRIS Backend',
		color: 'cyan',
	},
	testTimeout: 250,
	roots: ['<rootDir>/src/'],
	setupFilesAfterEnv: ['<rootDir>/src/tests/utils/expect.ts'],
	injectGlobals: true,
};

export default config;
