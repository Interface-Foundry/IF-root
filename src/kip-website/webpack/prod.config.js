const webpack = require('webpack');
const path = require('path');

const assetsPath = path.resolve(__dirname, '../dist');

module.exports = {
  entry: [
    'babel-polyfill',
    './js/index.js'
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'react-hot-loader/webpack!babel-loader'
      },
      { 
        test: /\.(png|jpg)$/,
        loader: 'file-loader?name=images/[name].[ext]' 
      },
      {   
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/, 
        loader: 'file-loader?name=fonts/[name].[ext]' 
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!autoprefixer?browsers=last 2 versions'
      },
      {
        test: /\.scss$|\.sass$/,
        loader: 'style-loader!css-loader!sass-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  output: {
    path: assetsPath,
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: assetsPath,
    historyApiFallback: true,
    hot: true
  },
  plugins: [
    new webpack.DefinePlugin({'process.env': {'NODE_ENV': '"production"'}}),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({minimize: true, compress: {warnings: false}})
  ]
};