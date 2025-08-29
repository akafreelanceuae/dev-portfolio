// .eslintrc.js
import next from 'eslint-config-next';

const config = [
  ...next,
  {
    rules: {
      'prefer-const': 'warn',
      'no-unused-vars': 'warn',
    },
  },
];

export default config;
