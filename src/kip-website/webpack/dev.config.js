const webpack = require('webpack');
const path = require('path');

const assetsPath = path.resolve(__dirname, '../dist');
var appDir = path.resolve(__dirname, '../js');

module.exports = {
  entry: [
    './js/index.js',
    "webpack-dev-server/client?http://localhost:3001/",
    'webpack/hot/only-dev-server'
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
    host: '0.0.0.0',
    disableHostCheck: true,
    contentBase: assetsPath,
    historyApiFallback: true,
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({'process.env': {'NODE_ENV': '"development"'}})
  ]
};