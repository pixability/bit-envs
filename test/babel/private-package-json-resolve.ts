const packageJson = {
  name: 'envs-config',
  version: '1.0.0',
  description: '',
  main: 'index.js',
  scripts: {
    test: "echo 'Error: no test specified' && exit 1"
  },
  keywords: [],
  author: '',
  license: 'ISC',
  dependencies: {
    'babel-preset-env': '^1.6.1',
    'babel-preset-latest': '^6.24.1',
    'babel-preset-react': '^6.24.1',
    chai: '^4.1.2',
    raven: '^2.4.2'
  },
  devDependencies: {
    'babel-plugin-inline-react-svg': '^0.5.4',
    'babel-plugin-object-values-to-object-keys': '^1.0.2',
    'babel-plugin-transform-async-to-generator': '^6.24.1',
    'babel-plugin-transform-async-to-module-method': '^6.24.1',
    'babel-plugin-transform-class-properties': '^6.24.1',
    'babel-plugin-transform-decorators-legacy': '^1.3.5',
    'babel-plugin-transform-export-extensions': '^6.22.0',
    'babel-plugin-transform-object-entries': '^1.0.0',
    'babel-plugin-transform-object-rest-spread': '^6.26.0',
    'babel-plugin-transform-react-jsx': '^6.24.1',
    'babel-plugin-transform-regenerator': '^6.26.0',
    bluebird: '^3.5.1'
  }
}

export default packageJson
