const webpack = require('webpack');
const path = require('path');

const assetsPath = path.resolve(__dirname, '../../public/build');
var appDir = path.resolve(__dirname, '../js');

module.exports = {
  entry: [
    'babel-polyfill',
    'webpack-hot-middleware/client?path=/__webpack_hmr', appDir + '/index'
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
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
};

// const path = require('path');
// const webpack = require('webpack');
// var BUILD_DIR = path.resolve(__dirname, '../../public/build');
// var APP_DIR = path.resolve(__dirname, '../js');

// module.exports = {
//   entry: ['babel-polyfill', 'webpack-hot-middleware/client?path=/__webpack_hmr', APP_DIR + '/index'],
//   output: {
//     path: BUILD_DIR,
//     filename: '[name].js',
//     publicPath: '/build/',
//     hotUpdateChunkFilename: 'hot/[hash].hot-update.js',
//     hotUpdateMainFilename: 'hot/[hash].hot-update.json'
//   },

//   plugins: [
//     new webpack.optimize.OccurrenceOrderPlugin(),
//     new webpack.HotModuleReplacementPlugin(),
//     new webpack.NoEmitOnErrorsPlugin(),
//     new webpack.DefinePlugin({
//       'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
//     })
//   ],
//   module: {
//     loaders: [{
//       test: /\.jsx?$|\.js$/,
//       exclude: /node_modules/,
//       loader: 'babel-loader',
//       query: {
//         'presets': ['react', 'es2015', 'stage-0']
//       }
//     }, {
//       test: /\.json?$/,
//       loader: 'json-loader'
//     }, {
//       test: /\.css$/,
//       exclude: /node_modules/,
//       use: [{
//           loader: 'style-loader',
//         },
//         {
//           loader: 'css-loader',
//           options: {
//             importLoaders: 1,
//           }
//         },
//         // {
//         //   loader: 'postcss-loader'
//         // }
//       ]
//     }, {
//       test: /\.scss$|\.sass$/,
//       exclude: /node_modules/,
//       use: [{
//           loader: 'style-loader',
//         },
//         {
//           loader: 'css-loader',
//           options: {
//             importLoaders: 1,
//           }
//         },
//         // {
//         //   loader: 'postcss-loader'
//         // },
//         {
//           loader: 'sass-loader'
//         }
//       ]
//     }, {
//       test: /\.svg$/,
//       loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
//     }, {
//       test: /\.(woff2?|svg)$/,
//       loader: 'url-loader?limit=10000'
//     }, {
//       test: /\.(ttf|eot)$/,
//       loader: 'file-loader'
//     }]
//   }
// };

