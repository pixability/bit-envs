module.exports = {
      testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
      transform: {
        '^.+\\.jsx?$': '<rootDir>/node_modules/babel-jest',
        '^.+\\.tsx?$': 'ts-jest'
      },
      'moduleFileExtensions': [
        'ts',
        'tsx',
        'js'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/.git/'
      ],
      'setupFiles': [],
      'preset': '<rootdir>/node_modules/some-module',

      'prettierPath':'<rootdir>/node_modules/pretty-module',
      'moduleNameMapper': {
        '@(.*)$': '<rootDir>/src/$1',
        '^dom$': './node_modules/dom/dist/vue.common.js'
      },
      'snapshotSerializers': ['./path/to/relative.js', 'serialize']
  };
