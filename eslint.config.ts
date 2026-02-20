import parser from '@typescript-eslint/parser';
import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import type { FlatESLintConfig } from 'eslint-define-config';

const config: FlatESLintConfig[] = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        node: 'readonly',
        commonjs: 'readonly',
        browser: 'readonly',
        es2020: 'readonly',
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        alias: {
          map: [
            ['#', './src'],
            ['#env', './env.mjs'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs as unknown as any,
      import: eslintPluginImport,
      'react-refresh': eslintPluginReactRefresh,
      'unused-imports': eslintPluginUnusedImports,
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      'jsx-a11y': eslintPluginJsxA11y,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'default-case': 'error',
      'react/self-closing-comp': 'error',
      'jsx-a11y/alt-text': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-script-url': 'error',
      'react/no-unused-prop-types': 'error',
      'react/no-danger': 'error',
      'import/no-unresolved': ['error', { caseSensitive: true }],
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-array-index-key': 'error',
      'jsx-a11y/anchor-is-valid': [
        'warn',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
      'import/order': [
        'error',
        {
          groups: [['builtin'], ['external'], ['internal', 'parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: 'react-dom/client',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '#/**/*',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['internal'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'no-unused-vars': 'off', // Let TypeScript handle this
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
        },
      ],
      '@typescript-eslint/ban-tslint-comment': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // TypeScript-specific rules - Performance & Best Practices
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': false,
          'ts-nocheck': false,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      'unused-imports/no-unused-imports': 'error',
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-single'],
      semi: ['error', 'always'],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          parser: 'typescript',
        },
      ],
    },
  },
];

export default config;
