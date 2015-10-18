var express = require('express');
var app = express();
var config = require('config');
var helmet = require('helmet');

// security for free
app.use(helmet());

// add in health check before sessions
app.get('/api/healthcheck', function(req, res) {
    res.send(200);
});

// proxy. in production, we sit behind a proxy but still want secure session cookies
if (config.isProduction) {
    app.set('trust proxy', 1); // trust first proxy
}

// load the app api at /styles
app.use('/styles', require('./IF_server'));

// load the admin interface only if we're in test
if (!config.isProduction) {
  app.use('/admin', require('./components/IF_admin/app'));
}

// redirect everything else to kipsearch.com
app.get('/adsfasdfdasf*', function(req, res) {
  res.redirect('https://kipsearch.com');
})

// unhandled requests get 404'd
app.use(function(req, res) {
  res.status(404);
  res.send('404 - not found');
})

app.listen(config.app.port, function () {
    console.log("Illya casting magic on " + config.app.port + " ~ ~ ♡");
});
