const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var BUILD_DIR = path.resolve(__dirname, 'public/build');
var APP_DIR = path.resolve(__dirname, 'react');

module.exports = {
  entry: ['babel-polyfill', 'webpack-hot-middleware/client?path=/__webpack_hmr', APP_DIR + '/index'],
  output: {
    path: BUILD_DIR,
    filename: '[name].js',
    publicPath: '/build/',
    hotUpdateChunkFilename: 'hot/[hash].hot-update.js',
    hotUpdateMainFilename: 'hot/[hash].hot-update.json'
  },

  plugins: [
    new CaseSensitivePathsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
  module: {
    loaders: [{
      test: /\.jsx?$|\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        'presets': ['react', 'es2015', 'stage-0']
      }
    }, {
      test: /\.json?$/,
      loader: 'json-loader'
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader']
    }, {
      test: /\.scss$|\.sass$/,
      use: [{
        loader: 'style-loader' // creates style nodes from JS strings
      }, {
        loader: 'css-loader' // translates CSS into CommonJS
      }, {
        loader: 'sass-loader' // compiles Sass to CSS
      }]
    }, {
      test: /\.svg$/,
      loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
    }, {
      test: /\.(woff2?|svg)$/,
      loader: 'url-loader?limit=10000'
    }, {
      test: /\.(ttf|eot)$/,
      loader: 'file-loader'
    }]
  }
};
