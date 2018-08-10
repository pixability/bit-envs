const packageJson = {
    name: 'envs-config',
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
        test: 'echo \'Error: no test specified\' && exit 1'
    },
    keywords: [],
    author: '',
    license: 'ISC',
    dependencies: {
        'babel-plugin-transform-object-rest-spread': '^6.26.0',
        'babel-preset-env': '^1.6.1',
        'babel-preset-latest': '^6.24.1',
        chai: '^4.1.2',
        raven: '^2.4.2'
    },
    devDependencies: {
        'babel-plugin-transform-async-to-module-method': '^6.24.1',
        bluebird: '^3.5.1'
    }
}
export default packageJson
