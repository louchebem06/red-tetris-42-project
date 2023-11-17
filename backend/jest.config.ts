import type { Config } from 'jest';

const config: Config = {
	verbose: true,
	forceExit: true,
	collectCoverage: true,
	collectCoverageFrom: ['<rootDir>/src/**/*.ts', '<rootDir>/src/*.ts'],
	coverageDirectory: 'src/tests/coverage-reports/',
	coveragePathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/dist/',
		'<rootDir>/src/docs/',
		'<rootDir>/src/tests/',
		'<rootDir>/src/tests/coverage-reports/',
	],
	coverageThreshold: {
		global: {
			branches: 0,
			functions: 0,
			lines: 0,
			statements: 0,
		},
	},
	reporters: ['default', ['github-actions', { silent: false }], 'summary'],
	displayName: {
		name: 'RED-TETRIS Backend',
		color: 'cyan',
	},
	testTimeout: 1000,
	roots: ['<rootDir>/src/'],
};

export default config;
