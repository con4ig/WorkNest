import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist', 'storybook-static', '.lighthouseci']),

    // App source.
    {
        files: ['src/**/*.{js,jsx}'],
        extends: [
            js.configs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            'no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^[A-Z_]|^_',
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_|^err$',
                },
            ],
            // Context files legitimately export both the Provider component
            // and the matching `useX` hook. Allowing constant exports keeps
            // HMR sensible without forcing a file split.
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },

    // Vitest test files — globals are explicit imports, but jsdom env
    // applies and some helpers reach for `global`.
    {
        files: ['src/**/*.{test,spec}.{js,jsx}', 'src/test/**/*.{js,jsx}'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },

    // Storybook story files — default exports are configs, not components.
    {
        files: ['src/**/*.stories.{js,jsx}', '.storybook/**/*.{js,jsx}'],
        rules: {
            'react-refresh/only-export-components': 'off',
            'no-unused-vars': 'off',
        },
    },

    // Tooling / config files run in Node.
    {
        files: ['*.config.{js,mjs}', 'vite.config.js', 'vitest.config.js'],
        languageOptions: {
            globals: { ...globals.node },
        },
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
])
