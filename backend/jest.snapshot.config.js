module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/ai-snapshot-standalone.test.js',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/**',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
