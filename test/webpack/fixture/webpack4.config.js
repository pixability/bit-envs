const config  = require('./webpack.config')
config.entry = {
    main: './index.ts',
    test: './main.spec.ts',
    another_test: './main.spec.ts'
}
module.exports = config
