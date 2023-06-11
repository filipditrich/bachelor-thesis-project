const mantineConfig = require('@mantine/eslint-config/prettier.config');

/**
 * Prettierrc configuration
 */
module.exports = {
	...mantineConfig,
	singleQuote: true,
	trailingComma: 'all',
	arrowParens: 'always',
	useTabs: true,
	bracketSpacing: true,
	semi: true,
	printWidth: 150,
	tabWidth: 2,
	plugins: ['prettier-plugin-tailwindcss'],
};
