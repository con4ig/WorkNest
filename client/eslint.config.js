import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ['dist', 'storybook-static', '.lighthouseci', 'node_modules'],
    },
    {
        files: ['src/**/*.{js,jsx}'],
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^[A-Z_]|^_',
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_|^err$',
                },
            ],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
    {
        files: ['src/**/*.{test,spec}.{js,jsx}', 'src/test/**/*.{js,jsx}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
    {
        files: ['src/**/*.stories.{js,jsx}', '.storybook/**/*.{js,jsx}'],
        rules: {
            'react-refresh/only-export-components': 'off',
            'no-unused-vars': 'off',
        },
    },
    {
        files: ['*.config.{js,mjs}', 'vite.config.js', 'vitest.config.js'],
        languageOptions: {
            globals: { ...globals.node },
        },
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
];
