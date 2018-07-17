const path = require('path');

module.exports = {
  mode: "production",
  entry: './index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader",
            options: {
                import: true,
                modules: true,
            }
        }]
    }, {
        test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
        loader: 'url-loader',
        query: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]'
        }
    }]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};

