module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testMatch: ['<rootDir>/tests/**/*.test.jsx', '<rootDir>/tests/**/*.test.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
};
