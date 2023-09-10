module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prefer-arrow-functions'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
	],
	ignorePatterns: ['.eslintrc.csjs'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'error',
		'@typescript-eslint/explicit-module-boundary-types': 'warn',
		'@typescript-eslint/no-explicit-any': 'warn',
		'max-len': ['error', { code: 100 }],
		'@typescript-eslint/naming-convention': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-var-requires': 'error',
		'require-await': 'error',
		'prefer-arrow-functions/prefer-arrow-functions': [
			'error',
			{
				classPropertiesAllowed: false,
				disallowPrototype: false,
				returnStyle: 'unchanged',
				singleReturnOnly: false,
			},
		],
	},
};
