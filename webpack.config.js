const webpack = require('webpack');

const config = {
  entry: './src/index.js',
  output: {
    filename: './dist/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
}

module.exports = config;
