module.exports = {
    roots: ['<rootDir>/src'],
    setupFiles: ['dotenv/config'],
    testMatch: ['**/tests/**/*.spec.ts'],
    transform: {
        '.tsx?$': 'ts-jest'
    }
};
