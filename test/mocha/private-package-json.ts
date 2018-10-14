const packageJson = {
  main: './dist/index.js',
  directories: {
    test: 'test'
  },
  scripts: {
    build: 'tsc -d',
    test:
      'mocha --require babel-core/register --require setup.js ' +
      '--require source-map-support/register ./**/*.spec.js',
    clean: 'rimraf ./dist/*'
  },
  devDependencies: {
    chai: '^4.1.2',
    mocha: '^5.2.0',
    rimraf: '^2.6.2',
    'source-map-support': '^0.5.6',
    'babel-core': '^6.26.3',
    'babel-preset-env': '^1.6.1'
  },
  dependencies: {}
}

export default packageJson
