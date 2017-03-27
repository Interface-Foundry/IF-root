const path = require('path');
const APP_DIR = path.resolve(__dirname, 'react');

module.exports = (config) => {
  	config.set({

	    // Add any browsers here
	    browsers: ['PhantomJS'],
	    frameworks: ['jasmine'],

	    // The entry point for our test suite
	    basePath: '.',
	    files: [
	    	'tests.webpack.js'
	    ],
	    preprocessors: {
	      // Run this through webpack, and enable inline sourcemaps
	      'tests.webpack.js': ['webpack', 'sourcemap'],
	    },

	    webpack: {
	      	devtool: 'inline-source-map',
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
			      	loader: 'json'
			    }, {
			      	test: /\.css$/,
			      	use: ['style-loader', 'css-loader']
			    }, {
			      	test: /\.scss$/,
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
	    },

	    client: {
	      	// log console output in our test console
	      	captureConsole: true
	    },

	    reporters: ['dots'],
	    singleRun: true, // exit after tests have completed

	    webpackMiddleware: {
	      	noInfo: true
	    },

	    // Webpack takes a little while to compile -- this manifests as a really
	    // long load time while webpack blocks on serving the request.
	    browserNoActivityTimeout: 60000, // 60 seconds

  	});
};