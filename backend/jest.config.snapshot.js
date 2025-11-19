module.exports = {
  testEnvironment: 'node',
  // Don't load the global setup file for snapshot tests
  setupFilesAfterEnv: [],
  testMatch: [
    '<rootDir>/tests/unit/aiService.snapshot.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/**',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
