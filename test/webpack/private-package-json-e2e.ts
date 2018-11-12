const packageJson = {
  main: './dist/index',
  devDependencies: {
    'css-loader': '1.0.0',
    'file-loader': '1.1.11',
    rimraf: '2.6.2',
    'style-loader': '0.21.0',
    'babel-loader': '^8.0.4',
    'url-loader': '1.0.1',
    'webpack-cli': '3.0.8',
    typescript: '2.7.1',
    'babel-plugin-inline-react-svg': '^1.0.1',
    'babel-plugin-object-values-to-object-keys': '^1.0.2',
    'babel-plugin-transform-async-to-generator': '^6.24.1',
    'babel-plugin-transform-class-properties': '^6.24.1',
    'babel-plugin-transform-decorators-legacy': '^1.3.5',
    'babel-plugin-transform-export-extensions': '^6.22.0',
    'babel-plugin-transform-object-entries': '^1.0.0',
    'babel-plugin-transform-object-rest-spread': '^6.26.0',
    'babel-plugin-transform-react-jsx': '^6.24.1',
    'babel-plugin-transform-regenerator': '^6.26.0',
    'babel-preset-latest': '^6.24.1',
    'babel-preset-react': '^6.24.1'
  },
  scripts: {
    build: 'webpack-cli --progress',
    clean: 'rimraf dist/*'
  },
  dependencies: {}
}

export default packageJson
