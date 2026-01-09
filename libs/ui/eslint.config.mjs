import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': 'off', // Meta-package: dependencies are for consumers, not direct usage
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
