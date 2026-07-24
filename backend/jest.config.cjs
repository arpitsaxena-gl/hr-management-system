/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/routes/**/*.js',
    '!src/**/*.test.js',
  ],
  coverageReporter: ['text', 'html'],
}
