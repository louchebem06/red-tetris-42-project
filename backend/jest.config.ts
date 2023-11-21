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
		// '<rootDir>/src/tests/App.spec.ts/',
	],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 70,
			lines: 70,
			statements: 70,
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
