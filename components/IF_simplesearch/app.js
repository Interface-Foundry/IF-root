// var db = require('db');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var compression = require('compression');
var base = process.env.NODE_ENV !== 'production' ? __dirname + '/static' : __dirname + '/dist';
var defaultPage = process.env.NODE_ENV !== 'production' ? __dirname + '/simpleSearch.html' : __dirname + '/dist/simpleSearch.html';
var querystring = require('querystring');

app.use(bodyParser.json());
app.use(express.static(base));
// app.use(require('prerender-node').set('prerenderToken', 'G7ZgxSO9pLyeidrHtWgX'));
app.use(require('prerender-node').set('prerenderServiceUrl', 'http://127.0.1.1:3000'));
app.use(require('prerender-node').set('protocol', 'https'));

// app.use(compression());

//express compression
// var oneDay = 86400000;


// app.use(express.static(__dirname + '/app/dist', {
//     maxAge: oneDay
// }));


app.get('/cinna/*', function(req, res, next) {
   res.redirect(querystring.unescape(req.url.replace('/cinna/',''))); //magic cinna moment
});


app.get('/*', function(req, res, next) {
    res.sendfile(defaultPage);
});


// app.post('/search', function(req, res, next) {
//     console.log(req.body);
// })


if (!module.parent) {
    app.listen(8088, function() {
        console.log('app listening on port 8088');
    })
} else {
    module.exports = app;
}
