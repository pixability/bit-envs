const packageJson = {
  main: './dist/index',
  devDependencies: {
    'css-loader': '^1.0.0',
    'file-loader': '^1.1.11',
    rimraf: '^2.6.2',
    'style-loader': '^0.21.0',
    'url-loader': '^1.0.1',
    'webpack-cli': '^3.0.8',
    '@babel/plugin-proposal-object-rest-spread': '^7.0.0',
    '@babel/plugin-transform-async-to-generator': '7.1.0',
    '@babel/preset-env': '7.1.5'
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
