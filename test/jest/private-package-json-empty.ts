const packageJson = {
  main: './dist/index',
  devDependencies: {
    '@types/jest': '^23.3.1',
    jest: '^23.4.2',
    rimraf: '^2.6.2',
    'ts-jest': '^23.0.1',
    'ts-loader': '^4.4.2',
    typescript: '2.7.1',
    'babel-jest': '^23.4.2',
    'react-dom': '^15.4.1',
    'some-module': '1.1.1',
    'pretty-module': '1.2.3',
    dom: '1.5.6',
    serialize: '1.4.5'
  },
  scripts: {
    build: 'tsc -d',
    clean: 'rimraf dist/*'
  },
  dependencies: {
    '@types/react': '^16.4.6'
  }
}

export default packageJson
