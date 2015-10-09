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

    if (req.body.val == 'linkback'){

        var collectItems = [];

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
                async.eachSeries(data, function iterator(item, callback) {
                    if (item.parents && item.parents.length > 0) {
                        async.eachSeries(item.parents, function iterator(parent, callback2) {
                            if (!parent || !item || !parent._id || parent._id == undefined || parent._id == null || !item._id || item._id == undefined || item._id == null) {
                                return callback2()
                            }
                            collectItems.push({
                                name: item.name,
                                lat:parent.loc.coordinates[1],
                                lng:parent.loc.coordinates[0],
                                item_id:item._id,
                                parent_id:parent._id,
                                img:item.itemImageURL[0]
                            });
                            
                            setTimeout(function () {
                              callback2()
                            }, 0)

                        }, function finished(err) {
                            if (err) console.log(err)
                            callback()
                        })
                    }
                    else {
                        callback()
                    }

                }, function finished(err){
                    if (err) console.log(err)
                    res.send(200,collectItems);
                });
            }
        });

    }
    else if (req.body.val == 'instasource'){

        var collectItems = [];
        db.Landmarks
        .find({
            'source_instagram_post.id': {
                $exists: true
            }
        })
        .populate('parents')
        .exec(function(err,data){
            if (err){ console.log (err)}
            else {
                async.eachSeries(data, function iterator(item, callback) {
                    if (item.parents && item.parents.length > 0) {
                        async.eachSeries(item.parents, function iterator(parent, callback2) {
                            if (!parent || !item || !parent._id || parent._id == undefined || parent._id == null || !item._id || item._id == undefined || item._id == null) {
                                return callback2()
                            }
                            collectItems.push({
                                name: item.name,
                                lat:parent.loc.coordinates[1],
                                lng:parent.loc.coordinates[0],
                                item_id:item._id,
                                parent_id:parent._id,
                                img:item.itemImageURL[0]
                            });
                            
                            setTimeout(function () {
                              callback2()
                            }, 0)

                        }, function finished(err) {
                            if (err) console.log(err)
                            callback()
                        })
                    }
                    else {
                        callback()
                    }

                }, function finished(err){
                    if (err) console.log(err)
                    res.send(200,collectItems);
                });
            }
        });





    }






});



if (!module.parent) {
    app.listen(8042, function() {
        console.log('app listening on port 8042');
    })
} else {
    module.exports = app;
}

//RUN with: NODE_ENV=digitalocean node app.js