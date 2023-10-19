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
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
	/*fakeTimers: {
		enableGlobally: true,
	},*/
	reporters: ['default', ['github-actions', { silent: false }], 'summary'],
	displayName: {
		name: 'RED-TETRIS Backend',
		color: 'cyan',
	},
	//slowTestThreshold: 5,
	testTimeout: 1000,
	roots: ['<rootDir>/src/'],
};

export default config;
