export const defaultConfig = {
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'jsx', 'js'],
  testPathIgnorePatterns: ['/node_modules/', '/.git/'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.tsx?$': 'ts-jest'
  }
}
