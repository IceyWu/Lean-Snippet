module.exports = [
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'semi': ['warn', 'always'],
      'curly': 'warn',
      'eqeqeq': 'warn',
      'no-throw-literal': 'warn',
    },
  },
  {
    ignores: ['out/**', 'dist/**', '**/*.d.ts', 'node_modules/**'],
  },
];
