module.exports = {
	roots: ['<rootDir>/src'],
	setupFiles: ['dotenv/config'],
	testMatch: ['**/tests/**/*.spec.tsx'],
	transform: {
		'.tsx?$': 'ts-jest'
	},
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'babel-jest'
	}
};
