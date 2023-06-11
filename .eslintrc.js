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
    "prettier/prettier": "error",
    "react/display-name": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/jsx-fragments": [
      "error",
      "element"
    ],
    "arrow-body-style": "warn",
    "global-require": "warn",
    "no-param-reassign": "off",
    "consistent-return": "warn",
    "prefer-destructuring": "off",
    "max-classes-per-file": "off"
  }
};
