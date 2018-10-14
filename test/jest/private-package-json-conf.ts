const packageJson = {
  main: './dist/index',
  devDependencies: {
    '@types/jest': '23.3.1',
    'babel-jest': '23.4.2',
    jest: '23.4.2',
    rimraf: '2.6.2',
    'ts-jest': '23.0.1',
    typescript: '2.7.1'
  },
  scripts: {
    build: 'tsc -d',
    clean: 'rimraf dist/*',
    test: 'jest'
  },
  dependencies: {},
  jest: {
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    transform: {
      '^.+\\.jsx?$': '<rootDir>/node_modules/babel-jest',
      '^.+\\.tsx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testPathIgnorePatterns: ['/node_modules/', '/.git/'],
    setupFiles: [],
    testEnvironment: 'node'
  }
}

export default packageJson
