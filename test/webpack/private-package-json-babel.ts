const packageJson = {
  main: './dist/index',
  devDependencies: {
    'css-loader': '^1.0.0',
    'file-loader': '^1.1.11',
    rimraf: '^2.6.2',
    'style-loader': '^0.21.0',
    'url-loader': '^1.0.1',
    'webpack-cli': '^3.0.8',
    'babel-plugin-transform-object-rest-spread': '^6.26.0',
    'babel-plugin-transform-async-to-module-method': '^6.24.1',
    'babel-preset-env': '^1.6.1',
    'babel-preset-latest': '^6.24.1'
  },
  scripts: {
    build: 'webpack-cli --progress',
    clean: 'rimraf dist/*'
  },
  dependencies: {
    '@types/react': '^16.4.6',
    'babel-loader': '^7.1.5',
    react: '^16.4.1',
    'react-dom': '^16.4.1'
  }
}

export default packageJson
