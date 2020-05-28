module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__test__/jest.setup.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
};
