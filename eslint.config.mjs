import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.js', '*.mjs', '*.cjs'],
  },
  {
    rules: {
      // CLI tool needs console output
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
