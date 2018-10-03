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
        typescript: '2.7.1'
    },
    scripts: {
        build: 'webpack-cli --progress',
        clean: 'rimraf dist/*'
    },
    dependencies: {
    }
}

export default packageJson
