module.exports = {
    preset: 'ts-jest',
    setupFiles: ['<rootDir>/.jest/setupEnvironment.js'],
    collectCoverageFrom: [
        '**/*.ts',
        '!src/index.ts',
        '!src/utils/**',
        '!bin/*.ts',
        '!**/*.test.ts',
        '!dist/*.ts',
        '!**/__fixtures__/**',
    ],
    testPathIgnorePatterns: ['<rootDir>/dist/'],
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
    coverageReporters: ['json-summary', 'json', 'lcov', 'text', 'clover'],
    verbose: true,
};
