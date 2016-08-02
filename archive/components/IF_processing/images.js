var spawn = require('child_process').spawn;
var app = require('express').Router();

var cmd = "convert";
var args = "$SRC -resize 640X640> -size 640X640 xc:white +swap -gravity center -composite jpeg:-";

/**
 * Return a 640x640 square image of the supplied url
 * GET /square?url=http://ecdn2.shoptiques.net/products/dac1500e-1e2f-4271-a780-caa23006ae8a_l.jpg
 */
app.get('/square', function(req, res, next) {
    if (!req.query.url) {
        next('need url query parameter');
    }

    var a = args.replace('$SRC', req.query.url).split(' ');
    var s = spawn(cmd, a, {stdio: ['pipe', 'pipe', process.stderr]});
    s.stdout.pipe(res);
});

module.exports = app;