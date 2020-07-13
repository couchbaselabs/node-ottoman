module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__test__/jest.setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.interface.ts', '!src/**/*.types.ts', '!**/node_modules/**'],
  testTimeout: 40000,
};
