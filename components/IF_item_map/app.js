var db = require('db');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var compression = require('compression');
var request = require('request');
var async = require('async');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

app.use(compression());


app.get('/*', function(req, res, next) {
    res.sendfile(__dirname + '/index.html');
});


app.post('/query', function(req, res, next) {
    //res.sendfile(__dirname + '/index.html');

    console.log('starting ',req.body.name);

    db.Landmarks
    .find({
        'source_generic_item': {
            $exists: true
        },
        'linkbackname': req.body.name
    })
    .populate('parents')
    .exec(function(err,data){
        if (err){ console.log (err)}
        else {
            console.log(data);
            async.eachSeries(data, function iterator(item, callback) {

                console.log('getting: ',item.name);

                //callback()

                if (item.parents.length > 0) {
                    async.eachSeries(data.parents, function iterator(parent, callback2) {
                        if (!parent || !item || !parent._id || parent._id == undefined || parent._id == null || !item._id || item._id == undefined || item._id == null) {
                            return callback2()
                        }
                        console.log(parent._id);
                        console.log(item._id);
                        // var urlEl = root.ele('url')
                        // var locEl = urlEl.ele('loc', null, 'http://www.kipsearch.com/t/' + parent._id + '/' + lm._id)
                        // if (lm.itemImageURL && lm.itemImageURL.length > 0) {
                        //     var i = 0
                        //     lm.itemImageURL.forEach(function(url) {
                        //         urlEl.ele('image:image', null, url)
                        //     })
                        // }

                        // var lastmodEl = urlEl.ele('lastmod', {}, (new Date().toString()))
                        // var changefreq = urlEl.ele('changefreq', {}, 'weekly')
                        // count++;
                        callback2()
                    }, function finished(err) {
                        if (err) console.log(err)
                        callback()
                    })
                }
                else {
                    callback()
                }

            });


        }
    });

    // stream.on('data', function(lm) {

    // })

    // stream.on('end', function() {
    //     console.log('Finished!');
    // })

    res.send(200,'asdf');


});



if (!module.parent) {
    app.listen(8042, function() {
        console.log('app listening on port 8042');
    })
} else {
    module.exports = app;
}

//RUN with: NODE_ENV=digitalocean node app.js