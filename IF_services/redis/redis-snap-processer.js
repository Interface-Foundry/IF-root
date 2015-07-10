var mongoose = require('mongoose'),
    // localdb = 'mongodb://localhost:27017/if',
    db = require('../../components/IF_schemas/db'),
    redis = require('redis'),
    client = redis.createClient(),
    request = require('request'),
    async = require('async'),
    opencv = require('../ImageProcessing/OpenCVJavascriptWrapper/index.js'),
    q = require('q')

client.on("connect", function(err) {
    console.log("Connected to redis");
});

var finished = false;
setInterval(function() {
    client.lrange('snaps', 0, -1, function(err, snaps) {
        if (snaps.length > 0 && !finished) {
            finished = !finished
            console.log('Processing...'+snaps.length + ' items for processing.')
            async.mapSeries(snaps, function(snap_str) {
                var snap = snap_str.toString().trim()
                async.waterfall([
                        function(callback) {
                            //Retrieve imgURL from landmark
                            getImageUrl(snap).then(function(url) {
                                console.log('Retrieved image URL: ', url)
                                callback(null, url)
                            }, function(err) {
                                console.log('getImageUrl error.', snap)
                                callback(err)
                            })
                        },
                        function(url, callback) {
                            //OpenCV processing
                            opencv.findItemsInImage(url, function(err, data) {
                                if (err)
                                    return callback(err)
                                console.log('opencv')
                                    //data is {items: [[xcenter,ycenter]]}
                                callback(null, url, data)
                            })
                        },
                        function(url, data, callback) {
                            //Process image through cloudsight
                            cloudSight(url, data).then(function(tags) {
                                console.log('cloudSight finished.', tags)
                                callback(null, tags)
                            }).catch(function(err) {
                                console.log('cloudSight error.', err)
                                callback(err)
                            })
                        },
                        function(tags, callback) {
                            //Update and save landmark
                            updateDB(snap, tags).then(function(snap) {
                                console.log('Saved!', snap)
                                callback(null)
                            }).catch(function(err) {
                                console.log('Save error.', err)
                                callback(err)
                            })
                        }
                    ],
                    //snap is done processing
                    function(err, results) {
                        console.log('Error: ', err)
                            //Remove from redis queue
                        client.lrem('snaps', 1, snap_str, redis.print);
                    });
            }, function(err, results) {
                //all snaps are done processing
                finished = !finished
                // console.log('Queue: ', client.llen())
            });
        }
    }); // end of client lrange
}, 6000);


//HELPER FUNCTIONS
function getImageUrl(landmarkID) {
    var deferred = q.defer();
    db.Landmarks.findById(landmarkID, function(err, landmark) {
        if (err) deferred.reject(err)
        if (landmark) {
            if (landmark.source_instagram_post.img_url) {
                deferred.resolve(img_url)
            } else if (landmark.itemImageURL) {
                //First img only for now, change later
                deferred.resolve(landmark.itemImageURL)
            }
        } else {
            console.log('id: ', landmarkID, ' landmark: ', landmark)
            deferred.reject('No imgURL found in snap')
        }
    })
    return deferred.promise;
}

function cloudSight(imgURL, data) {
    var deferred = q.defer();
    var qs = {}
    //If OpenCV Image processing failed
    if (data.items == undefined) {
        async.eachSeries(imgURL, function iterator(img, done) {
            var tags = []
            qs = {
                'image_request[remote_image_url]': img,
                'image_request[locale]': 'en-US',
                'image_request[language]': 'en'
            }
            getTags(qs).then(function(tags) {
                tags.concat(tags)
                done()
            })
        }, function(err) {
            if (err) {
                console.log('Finished Error: ', err)
                deferred.reject(err);
            }
            console.log('Finished tagging: ', tags)
            deferred.resolve(tags)
        }); //End of eachseries
    //If OpenCV Image processing did not fail
    } else {
        console.log('SHOULD NOT BE HITTING DIS')
        var tags = []
        async.eachSeries(data.items, function iterator(item, done) {
            qs = {
                'image_request[remote_image_url]': imgURL,
                'image_request[locale]': 'en-US',
                'image_request[language]': 'en',
                'focus[x]': item[0],
                'focus[y]': item[1]
            }
            getTags(qs).then(function(tags) {
                tags.concat(tags)
                done()
            })
        }, function(err) {
            if (err) {
                console.log('Finished Error: ', err)
                deferred.reject(err);
            }
            deferred.resolve(tags)
        }); //End of eachseries
    }

    return deferred.promise;
}

function getTags(qs) {
    var deferred = q.defer();
    var options = {
        url: "https://api.cloudsightapi.com/image_requests",
        headers: {
            "Authorization": "CloudSight cbP8RWIsD0y6UlX-LohPNw"
        },
        qs: qs
    }
    request.post(options, function(err, res, body) {
            if (err) return deferred.reject(err)
            try {
                var data = JSON.parse(body);
            } catch (e) {
                console.error('could not parse cloudsight response');
                console.error(body);
                return deferred.reject(e)
            }
            var results = {
                status: 'not completed'
            };
            var description = '';
            var tries = 0;
            async.whilst(
                function() {
                    return (results.status == 'not completed' && tries < 7);
                },
                function(callback) {
                    var options = {
                        url: "https://api.cloudsightapi.com/image_responses/" + data.token,
                        headers: {
                            "Authorization": "CloudSight cbP8RWIsD0y6UlX-LohPNw"
                        }
                    }
                    request(options, function(err, res, body) {
                        if (err) return deferred.reject(err)
                        console.log('cloudsight status is..', body)
                        try {
                            var body_parsed = JSON.parse(body);
                        } catch (e) {
                            console.error('could not parse some cloudsight api call');
                            console.error(body);
                            return deferred.reject(e)
                        }
                        body = body_parsed;
                        if (body.status == 'completed') {
                            results.status = 'completed';
                            description = body.name;
                            console.log('Cloudsight Tag: ', body)
                                //TODO: Filter out common words
                            var uncommonArray = getUncommon(body.name)
                            tags.push(uncommonArray);
                            return deferred.resolve(tags)
                        } //END OF BODY.STATUS COMPLETED
                    })
                    tries++;
                    console.log(tries + "/7 tries.")
                    setTimeout(callback, 5000);
                },
                function(err) {
                    if (err) return deferred.reject(err)
                    console.log('Finished tagging...')
                }); //END OF ASYNC WHILST
        }) //END OF CLOUDSIGHT REQUEST
    return deferred.promise
}

function updateDB(landmarkID, tags) {
        // tags is ['man','red','striped','sweater']
        var deferred = q.defer();
        landmark.findOne({
            _id: landmarkID
        }, function(err, landmark) {
            if (err) deferred.reject(err)
            if (landmark) {
                tags.forEach(function(tag) {
                    //TODO: MIGHT UPDATE THIS SINCE LANDMARKSCHEMA TAGS PROPERTY WILL CHANGE
                    landmark.tags.text.push(tag)
                })
                landmark.save(function(err, saved) {
                    if (err) console.log(err)
                    console.log('Updated landmark:', saved)
                    deferred.resolve(saved);
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise;
    }
    //TODO: This list may need some modifying
var common = "the,it,is,a,an,by,to,he,she,they,we,i,are,to,for,of";

function getUncommon(sentence, common) {
    var wordArr = sentence.match(/\w+/g),
        commonObj = {},
        uncommonArr = [],
        word, i;
    common = common.split(',');
    for (i = 0; i < common.length; i++) {
        commonObj[common[i].trim()] = true;
    }
    for (i = 0; i < wordArr.length; i++) {
        word = wordArr[i].trim().toLowerCase();
        if (!commonObj[word]) {
            //Change any "man" or "woman" to "mens" and "womens"
            if (word == 'man') {
                word = 'mens'
            } else if (word == 'woman') {
                word = 'womens'
            }
            uncommonArr.push(word);
        }
    }
    return uncommonArr;
}