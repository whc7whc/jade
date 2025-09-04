module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.js', '**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
};