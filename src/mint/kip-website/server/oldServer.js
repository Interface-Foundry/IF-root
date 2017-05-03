var port = (process.env.PORT || 3001);
var http = require('http');
var WebpackDevServer = require("webpack-dev-server");
var webpack = require('webpack');
var Config = require('../webpack/old.config.js');
var path = require('path');
var express = require('express');

var compiler = webpack(Config);

var server = new WebpackDevServer(compiler, {
	contentBase: './dist',
    publicPath: '/',
    filename: 'bundle.js',
	historyApiFallback: true,
	hot: true,
	inline: true
});

server.listen(port, "0.0.0.0");
