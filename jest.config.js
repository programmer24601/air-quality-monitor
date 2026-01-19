module.exports = {
  preset: "ts-jest",
  setupFiles: ["<rootDir>/.jest/setupEnvironment.js"],
  collectCoverageFrom: [
    "**/*.ts",
    "!src/index.ts",
    "!src/utils/**",
    "!bin/*.ts",
    "!**/*.test.ts",
    "!dist/*.ts",
    "!**/__fixtures__/**"
  ],
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 88,
      functions: 92,
      lines: 89
    }
  },
  coverageReporters: ["json-summary", "json", "lcov", "text", "clover"],
  verbose: true
};
