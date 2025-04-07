const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.sst/**',
      '.open-next/**',
      'cdk.out/**',
      '.next/**',
      '**/*.js.map',
      '**/*.d.ts',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Add browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        HTMLElement: 'readonly',
        performance: 'readonly',
        setImmediate: 'readonly',
        self: 'readonly',
        global: 'readonly',

        // Add Node.js globals
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',

        // Add specific globals that appear in the codebase
        _N_E: 'readonly',
        $config: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      // Disable rules that are triggering errors in the minified/compiled files
      'no-undef': 'error',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',

      // Ensure return types are explicit for functions
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],

      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];
