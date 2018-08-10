const packageJson = {
    main: './dist/index',
    devDependencies: {
        'css-loader': '^1.0.0',
        'file-loader': '^1.1.11',
        rimraf: '^2.6.2',
        'style-loader': '^0.21.0',
        'ts-loader': '^4.4.2',
        'url-loader': '^1.0.1',
        'webpack-cli': '^3.0.8'
    },
    scripts: {
        build: 'webpack-cli --progress',
        clean: 'rimraf dist/*'
    },
    dependencies: {
        chai: '^4.1.2',
        react: '^16.4.1',
        'react-dom': '^16.4.1',
        '@types/react': '^16.4.8',
        '@types/react-dom': '^16.0.7'
    }
}

export default packageJson
