const path = require('path'),
  webpack = require('webpack'),
  BUILD_DIR = path.resolve(__dirname, 'public/build'),
  CART_DIR = path.resolve(__dirname, 'react'),
  HOME_DIR = path.resolve(__dirname, 'kip-website');
module.exports = {
  entry: {
    cart: ['babel-polyfill', CART_DIR + '/index'],
    home: ['babel-polyfill', HOME_DIR + '/index']
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].js',
    publicPath: '/build/'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.GA':  JSON.stringify(true || process.env.GA)
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({ minimize: true, compress: { warnings: false } }),
    new webpack.optimize.CommonsChunkPlugin({ name: 'common' })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
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
      loader: 'style-loader!css-loader!autoprefixer?browsers=last 2 versions'
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
        {
          loader: 'postcss-loader'
        },
        {
          loader: 'sass-loader'
        }
      ]
    }, {
      test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: 'file-loader?name=fonts/[name].[ext]'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'file-loader?name=images/[name].[ext]'
    }, ]
  }
};
