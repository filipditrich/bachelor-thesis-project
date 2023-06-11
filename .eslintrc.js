/**
 * ESLint configuration
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  plugins: [ "prettier", "eslint-plugin-react-hooks" ],
  ignorePatterns: [ "node_modules/", "*.js" ],
  extends: [ "prettier", "mantine", "plugin:@next/next/recommended", "plugin:react-hooks/recommended" ],
  parserOptions: {
    project: "./tsconfig.json"
  },
  rules: {
    'prettier/prettier': 'error',
    'react/display-name': 'warn',
    'react/no-unknown-property': [
      'error',
      {
        ignore: ['css', 'tw'],
      },
    ],
    'react/jsx-fragments': ['error', 'element'],
    'arrow-body-style': 'warn',
    'global-require': 'warn',
    'no-param-reassign': 'off',
    'consistent-return': 'warn',
    'no-tabs': 'off',
    'max-len': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'react/jsx-indent-props': 'off',
    'import/no-cycle': 'warn',
    '@typescript-eslint/no-shadow': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-restricted-syntax': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    curly: 'off',
    'nonblock-statement-body-position': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    'react/style-prop-object': 'off',
    'no-spaced-func': 'off',
    'import/order': 'off',
    'import/extensions': 'off',
    'react/jsx-pascal-case': 'warn',
    'max-classes-per-file': 'off',
    "no-case-declarations": "off"
  }
};
