import wizardryConfig from 'eslint-config-wizardry';

const config = [
  {
    ignores: ['dist/**'],
  },
  ...wizardryConfig,
  {
    rules: {
      'react/jsx-no-leaked-render': 'off',
      'no-bitwise': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];

export default config;
