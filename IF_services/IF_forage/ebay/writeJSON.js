//FIRST TIME RUNNING: Create json file with [] in root folder
//TODO: Creast FS DOES IMAGE FILE EXIST CHECK before writing to JSON
var mongoose = require('mongoose'),
    ObjectId = require('mongoose').Types.ObjectId
db = require('db'),
    async = require('async'),
    _ = require('lodash'),
    urlify = require('urlify').create({
        addEToUmlauts: true,
        szToSs: true,
        spaces: "_",
        nonPrintable: "_",
        trim: true
    }),
    request = require('request'),
    Promise = require('bluebird'),
    fs = require('fs'),
    osHomedir = require('os-homedir'),
    client = require('../../../redis.js'),
    feedData = require(osHomedir() + '/feed_data.json');

var mongoStream = db.FeedData
    .find({})
    .sort({
        '_id': -1
    })
    // .skip(700)
    // .limit(50)
    .lean()
    .stream();

var list = 'feed'

//Uncomment below and run file to clear redis queue before running.
// !!Careful with this, Clearing the list when its emplty will sometimes break the list in redis ::shrug::
console.log('clearing list..')
client.ltrim(list, 1, 0)

mongoStream.on('data', function(datum) {
    client.rpush(list, JSON.stringify(datum), function(err, reply) {
        if (err) {
            err.niceMessage = 'Could not connect to redis client.';
            err.devMessage = 'REDIS QUEUE ERR';
            console.log(err)
        }
    });
})

mongoStream.on('end', function() {})

var timer = new InvervalTimer(function() {
    client.lrange(list, 0, -1, function(err, data) {
        if (data && data.length > 0) {
            console.log('Queue: ' + data.length)
        }
        if (data.length > 0) {
            timer.pause();
            console.log(data.length + ' item(s) for processing.')
            async.eachSeries(data, function(datum_str, finishedDatum) {
                datum = JSON.parse(datum_str)
                console.log(datum._id)
                db.FeedData.findById(datum._id.toString(), function(err, node) {
                    if (err) {
                        console.log(err)
                        return finishedDatum()
                    }
                    if (!node || (node.data && node.data.trained)) {
                        console.log('Node already trained or not found.')
                        return finishedDatum()
                    }
                    var stats;
                    try {
                        stats = fs.lstatSync(node.local_path);
                        if (stats.isFile()) {
                            console.log('Found!')
                        } else {
                            console.log('Image not found.')
                            return finishedDatum()
                        }
                    } catch (e) {
                        console.log('Image not found.', e)
                        return finishedDatum()
                    }
                    node.data = {}
                    node.data.trained = true;
                    node.save(function(err, saved) {
                        if (err) {
                            console.log(err)
                            return finishedDatum()
                        }
                        console.log('Updated document: ', node)
                        var jsonObj = {
                            file_path: node.file_path,
                            captions: node.captions
                        }
                        feedData.push(jsonObj)
                        fs.writeFile(osHomedir() + '/feed_data.json', JSON.stringify(feedData), function(err) {
                            if (err) console.log(err);
                            console.log('Added to file!')
                            finishedDatum()
                        });
                    })
                })
            }, function finishedData(err, results) {
                timer.resume()
            });
        }
    })
}, 2000);


function InvervalTimer(callback, interval) {
    var timerId, startTime, remaining = 0;
    var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.pause = function() {
        if (state != 1) return;

        remaining = interval - (new Date() - startTime);
        clearInterval(timerId);
        state = 2;
    };

    this.resume = function() {
        if (state != 2) return;

        state = 3;
        setTimeout(this.timeoutCallback, remaining);
    };

    this.timeoutCallback = function() {
        if (state != 3) return;

        callback();

        startTime = new Date();
        timerId = setInterval(callback, interval);
        state = 1;
    };

    startTime = new Date();
    timerId = setInterval(callback, interval);
    state = 1;
}

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}