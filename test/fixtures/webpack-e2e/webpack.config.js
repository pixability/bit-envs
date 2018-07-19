const path = require('path');

module.exports = {
  mode: "production",
  entry: {
      main: './index.ts'
  },
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
        test: /\.(jpg|png)$/,
        loader: 'url-loader',
        query: {
            limit: 10000,
        }
    }]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  }
};

