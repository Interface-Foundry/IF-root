var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'eval',
    entry: [
        'webpack-hot-middleware/client',
        './client/index'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    plugins: [

        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
            }
        })
    ],
    module: {
        loaders: [{
                test: /\.js$/,
                loaders: ['babel'],
                include: path.join(__dirname, 'client')
            }, {
                test: /\.css?$/,
                loaders: ['style', 'raw']
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                test: /\.png$/,
                loader: 'url-loader?limit=8192&&mimetype=image/png'
            } // inline base64 URLs for <=8k images, direct URLs for the rest
        ]
    }
};