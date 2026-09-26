import astro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';
export default [
  { ignores: ['dist/**', '.astro/**', '.sites-runtime/**'] },
  ...astro.configs.recommended,
  { files: ['**/*.astro'], languageOptions: { parserOptions: { parser: tsParser } } },
];
