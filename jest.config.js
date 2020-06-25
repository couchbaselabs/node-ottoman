module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__test__/jest.setup.ts'],
  collectCoverageFrom: ['lib/**/*.js', '!lib/**/*.interface.js', '!lib/**/*.types.js', '!**/node_modules/**'],
  testTimeout: 20000,
};
