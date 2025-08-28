// .eslint.config.mjs
import next from 'eslint-config-next';

export default [
  ...next,
  {
    rules: {
      'prefer-const': 'warn',
      'no-unused-vars': 'warn',
    },
  },
];
