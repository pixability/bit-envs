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
    '@babel/plugin-proposal-object-rest-spread': '^7.0.0',
    '@babel/preset-env': '7.1.5',
    '@babel/preset-react': '^7.0.0',
    chai: '^4.1.2',
    raven: '^2.4.2'
  },
  devDependencies: {
    '@babel/plugin-transform-async-to-generator': '7.1.0',
    bluebird: '^3.5.1'
  }
}
export default packageJson
