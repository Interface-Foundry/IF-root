const path = require('path'),
  webpack = require('webpack'),
  CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin'),
  BUILD_DIR = path.resolve(__dirname, 'public/build'),
  CART_DIR = path.resolve(__dirname, 'react'),
  HOME_DIR = path.resolve(__dirname, 'kip-website');

module.exports = {
  entry: {
    cart: ['babel-polyfill', 'webpack-hot-middleware/client?name=cart', CART_DIR + '/index'],
    home: ['babel-polyfill', 'webpack-hot-middleware/client?name=home', HOME_DIR + '/index']
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].js',
    publicPath: '/build/',
    hotUpdateChunkFilename: 'hot/[hash].hot-update.js',
    hotUpdateMainFilename: 'hot/[hash].hot-update.json',
    devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new CaseSensitivePathsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProgressPlugin(),
    new webpack.optimize.CommonsChunkPlugin({ name: 'common' }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
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
      exclude: /node_modules/,
      use: [{
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          }
        },
        // {
        //   loader: 'postcss-loader'
        // }
      ]
    }, {
      test: /\.scss$|\.sass$/,
      exclude: /node_modules/,
      use: [{
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          }
        },
        // {
        //   loader: 'postcss-loader'
        // },
        {
          loader: 'sass-loader'
        }
      ]
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
