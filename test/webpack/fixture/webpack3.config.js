const config  = require('./webpack.config')
config.module.rules.push({
    test: /\.(jpg|png)$/,
    use: {
      loader: 'file-loader',
      options: {
        name: '[path][name].[hash].[ext]',
      },
    },
  })
config.entry = {
    main: './main.tsx'
}

module.exports = config
