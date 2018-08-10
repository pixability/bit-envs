const packageJson = {
    main: './dist/index',
    devDependencies: {
        '@types/jest': '23.3.1',
        'babel-jest': '23.4.2',
        jest: '23.4.2',
        rimraf: '2.6.2',
        'ts-jest': '23.0.1',
        typescript: '2.7.1'
    },
    scripts: {
        build: 'tsc -d',
        clean: 'rimraf dist/*',
        test: 'jest'
    },
    dependencies: {}
}

export default packageJson;
