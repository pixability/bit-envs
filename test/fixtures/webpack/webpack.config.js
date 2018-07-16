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

// assign entires with the one with the main file of component
// resolve dependencies from loaders
// init function will return configuration object {write:true} - done
// actual bundling should be with in memory fs
// use can be string or array, loader can only be string - done
// `It's no longer allowed to omit the '-loader' suffix when specifying loader names.`
