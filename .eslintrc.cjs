module.exports = {
  extends: ['airbnb-base'],
  plugins: ['jest', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  env: {
    'jest/globals': true,
  },
};
