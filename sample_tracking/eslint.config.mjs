import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    extends: [
      'airbnb',
      'next',
      'prettier',
      'plugin:react/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
    ],
  },
  {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      'airbnb',
      'next',
      'prettier',
      'prettier/react',
      'plugin:react/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
    ],
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'space-before-function-paren': 'off',
      'react/prop-types': 'off',
      'react/jsx-filename-extension': [
        1,
        { extensions: ['.js', '.jsx', '.tsx'] },
      ],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [1],
      'import/extensions': 'off',
      'no-console': 'off',
      camelcase: 'off',
      'react/jsx-props-no-spreading': 'off',
      'no-underscore-dangle': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'prettier/prettier': 'error',
      'space-before-function-paren': 'off',
      'react/prop-types': 'off',
      'react/jsx-filename-extension': [
        1,
        { extensions: ['.js', '.jsx', '.tsx'] },
      ],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [1],
      'import/extensions': 'off',
      'no-console': 'off',
      camelcase: 'off',
      'react/jsx-props-no-spreading': 'off',
      'no-underscore-dangle': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'react/jsx-no-bind': 'off',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint', 'prettier', 'import'],
    settings: {
      next: {
        rootDir: ['apps/*/', 'packages/*/'],
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: ['apps/*/tsconfig.json'],
        },
      },
    },
    ignorePatterns: [
      '**/*.js',
      '**/*.json',
      'node_modules',
      'public',
      'styles',
      '.next',
      'coverage',
      'dist',
    ],
  },
]
