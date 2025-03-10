module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], // Only match TypeScript test files
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
