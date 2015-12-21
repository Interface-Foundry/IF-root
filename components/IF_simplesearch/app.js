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
var request = require('request');
var db = require('db');
var kip = require('kip')
var fs = require('fs')

app.use(compression());
app.use(bodyParser.json());
app.use(express.static(base));
// app.use(require('prerender-node').set('prerenderToken', 'G7ZgxSO9pLyeidrHtWgX'));
app.use(require('prerender-node').set('prerenderServiceUrl', 'http://127.0.1.1:3000'));
app.use(require('prerender-node').set('protocol', 'https'));

//express compression
// var oneDay = 86400000;


// app.use(express.static(__dirname + '/app/dist', {
//     maxAge: oneDay
// }));

app.get('/newslack', function(req, res) {
    console.log('new slack integration request');
    // TODO post in our slack #dev channel
    // TODO check that "state" property matches
    res.redirect('/thanks')

    if (!req.query.code) {
        console.error(new Date())
        console.error('no code in the callback url, cannot proceed with new slack integration')
        // TODO post error in slack channel
        return;
    }

    var body = {
      code: req.query.code,
      redirect_uri: 'https://kipsearch.com/newslack'
    }

    request({
      url: 'https://2804113073.14708197459:d4c324bf9caa887a66870abacb3d7cb5@slack.com/api/oauth.access',
      method: 'POST',
      form: body
    }, function(e, r, b) {
        if (e) {
          console.log('error connecting to slack api');
          console.log(e);
        }
        if (typeof b === 'string') {
            b = JSON.parse(b);
        }
        if (!b.ok) {
            console.error('error connecting with slack, ok = false')
            console.error('body was', body)
            console.error('response was', b)
            return;
        } else if (!b.access_token || !b.scope) {
            console.error('error connecting with slack, missing prop')
            console.error('body was', body)
            console.error('response was', b)
            return;
        }

        console.log('got positive response from slack')
        console.log('body was', body)
        console.log('response was', b)
        var bot = new db.Slackbot(b)
        bot.save(function(e) {
            kip.err(e);
            request('http://chat.kipapp.co/newslack', function(e, r, b) {
                if (e) {
                    console.error('error triggering chat server slackbot update')
                }
            })
        })
    })


})

// var thanks = fs.readFileSync(__dirname + '/thanks.html', 'utf8');
app.get('/thanks', function(req, res) {
  var thanks = fs.readFileSync(__dirname + '/thanks.html', 'utf8');
  res.send(thanks);
})

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
