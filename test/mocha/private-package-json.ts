const packageJson = {
  main: './dist/index.js',
  directories: {
    test: 'test'
  },
  scripts: {
    build: 'tsc -d',
    test:
      'mocha --require @babel/register --require setup.js ' +
      '--require source-map-support/register ./**/*.spec.js',
    clean: 'rimraf ./dist/*'
  },
  devDependencies: {
    chai: '^4.1.2',
    mocha: '^5.2.0',
    rimraf: '^2.6.2',
    'source-map-support': '^0.5.6',
    '@babel/core': '^7.1.2',
    '@babel/register': '^7.0.0',
    '@babel/preset-env': '7.1.5',
    '@babel/plugin-proposal-object-rest-spread': '^7.0.0',
    '@babel/plugin-transform-async-to-generator': '^7.1.0'
  },
  dependencies: {}
}

export default packageJson
