var port = (process.env.PORT || 3001);
var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var WebpackDevServer = require("webpack-dev-server");
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require("webpack-hot-middleware");
var webpack = require('webpack');
var Config = require('../webpack/dev.config.js');
var app = express();

// live reloading
if (!process.env.NO_LIVE_RELOAD) {
  var compiler = webpack(Config);
  app.use(webpackDevMiddleware(compiler, {
    hot: true,
    filename: '[name].js',
    publicPath: '/build/',
    stats: {
      colors: true
    },
    historyApiFallback: true
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }));
} else {
   app.get('/__webpack_hmr', (req, res) => {
     res.status(200).end()
   })
}

/**
 * BORING STUFF (TODO move this to a file name boilerplate.js)
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../server', 'views'));
app.use(express.static(path.resolve(__dirname, '../..', 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

/**
 *  Always return the main index.html, so react-router render the route in the client
 *  Basically, anything that's not an api gets handled by react-router
 *  we can pass arrays to react by embedding their strings in javascript
 *  we could handle session data through fetching data with react
 */
app.get('*', (req, res) =>
  // Get the user_accont info, if exists (might not if they are clicking a shared link)
  // Get the cart info, if doesn't exist res.render('pages/404'), views/pages/404.ejs static page, a nice 404 with a Start Shopping link to create a new cart.
  res.render('pages/index')
);

app.listen(port, () => {
  console.log(`App listening at http://127.0.0.1:${port}`);
});


