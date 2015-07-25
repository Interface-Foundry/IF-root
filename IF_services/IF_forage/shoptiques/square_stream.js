var spawn = require('child_process').spawn;
var express = require('express');
var app = express();

var cmd = "convert";
var args = "$SRC -resize 640X640> -size 640X640 xc:white +swap -gravity center -composite jpeg:-";

app.get('/square', function(req, res, next) {
    if (!req.query.url) {
        next('need url query parameter');
    }

    var a = args.replace('$SRC', req.query.url).split(' ');
    var s = spawn(cmd, a, {stdio: ['pipe', 'pipe', process.stderr]});
    s.stdout.pipe(res);
});

app.use(function error_handler(err, req, res, next) {
    console.error(err);
    res.json(err);
});

app.listen(9090);

//curl 'http://ecdn2.shoptiques.net/products/dac1500e-1e2f-4271-a780-caa23006ae8a_l.jpg' | convert - -resize 640X640\> -size 640X640 xc:white +swap -gravity center -composite jpeg:- > out3.jpg
