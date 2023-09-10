import type { Config } from 'jest'

const config: Config = {
	verbose: true,
	forceExit: true,
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	displayName: {
		name: 'RED-TETRIS Backend',
		color: 'cyan',
	},
	roots: ['<rootDir>/src/'],
}

export default config
