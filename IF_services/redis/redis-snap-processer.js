var mongoose = require('mongoose'),
    _ = require('underscore'),
    db = require('../../components/IF_schemas/db'),
    redis = require('redis'),
    client = redis.createClient(),
    request = require('request'),
    async = require('async'),
    opencv = require('../ImageProcessing/OpenCVJavascriptWrapper/index.js'),
    q = require('q'),
    //TODO: These lists may need to be improved
    common = "the,it,is,a,an,and,by,to,he,she,they,we,i,are,to,for,of,with"

client.on("connect", function(err) {
    console.log("Connected to redis");
});

var timer = new InvervalTimer(function() {
    client.lrange('snaps', 0, -1, function(err, snaps) {
            console.log('Queue: ' + snaps.length)
            if (snaps.length > 0) {
                console.log('Pausing timer')
                timer.pause();
                console.log(snaps.length + ' items for processing.')
                async.mapSeries(snaps, function(snap_str) {
                    var snap = snap_str.toString().trim()
                    async.waterfall([
                            function(callback) {
                                //Retrieve imgURL from landmark
                                getImageUrl(snap).then(function(url) {
                                    console.log('Retrieved image URL array..')
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
                                    callback(null, url, data)
                                })
                            },
                            function(url, data, callback) {
                                // console.log('reaching cloudsight', url)
                                //Process image through cloudsight
                                cloudSight(url, data).then(function(tags) {
                                    console.log('cloudSight finished.', tags)
                                    callback(null, tags)
                                }).catch(function(err) {
                                    console.log('cloudSight error.', err)
                                    if (err == 'no tags found') {
                                        //Remove from redis queue
                                        client.lrem('snaps', 1, snap_str);
                                        timer.resume()
                                    }
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
                            client.lrem('snaps', 1, snap_str);
                            timer.resume()
                        });
                }, function(err, results) {
                    //all snaps are done processing
                    console.log('Resuming timer!')
                    timer.resume()
                });
            }
        }) // end of client lrange, callback)
}, 5000);

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
    var qs = {};
    var results = []
        //----If OpenCV Image processing does not return coordinates----//
    if (data.items == undefined || data.items == null || (data.items.length == 1 && data.items.coords == null) ) {
        console.log('OpenCV did not find coordinates.')
        async.eachSeries(imgURL, function iterator(img, done) {
            console.log('tagging image:', img)
            qs = {
                'image_request[remote_image_url]': img,
                'image_request[locale]': 'en-US',
                'image_request[language]': 'en'
            }
            getTags(qs).then(function(tags) {
                results = results.concat(tags)
                done()
            }).catch(function(err) {
                if (err) console.log(err)
                done()
            })
        }, function(err) {
            if (err) {
                console.log('Finished Error: ', err)
                deferred.reject(err);
            }
            console.log('Finished looking for tags..', results)
            if (results == undefined) {
                deferred.reject('No tags found')
            } else {
                deferred.resolve(results)
            }
        }); //End of eachseries
        //----If OpenCV Image processing did not fail----//
    } else {
        console.log('OpenCV successfully returned focus coordinates.',data.items)
            //---For each image
        async.eachSeries(imgURL, function iterator(img, finishedImage) {
                var failCount = 0;
                //---For each set of coordinates
                async.eachSeries(data.items, function iterator(item, finishedCoord) {
                            var lastIndex = item.coords.length
                            console.log(lastIndex + ' focal points found for current image.',item.coords)

                                //---For each request to cloudsight
                            async.eachSeries(item.coords, function iterator(coord, finishedRequest) {
                                qs = {
                                    'image_request[remote_image_url]': img,
                                    'image_request[locale]': 'en-US',
                                    'image_request[language]': 'en',
                                    'focus[x]': coord[0] + coord[2] / 2,
                                    'focus[y]': coord[1] + coord[3] / 2
                                }
                                getTags(qs).then(function(tags) {
                                    results = results.concat(tags[0]);
                                    finishedRequest()
                                }).catch(function(err) {
                                    if (err) {
                                        console.log('Error: ', err)
                                        failCount++
                                        if (failCount == item.coords.length) {
                                            console.log('No tags found in any of the focus points!')
                                            return finishedRequest(err)
                                        } else {
                                            console.log('No tags found for this focal point.')
                                            return finishedRequest()
                                        }
                                    }

                                    finishedRequest()
                                })
                            }, function(err) {
                                if (err) {
                                    console.log('Error: ', err)
                                    return finishedCoord(err)
                                }
                                finishedCoord()
                            });
                        },
                        function(err) {
                            if (err) {
                                console.log('Error: ', err)
                                return finishedImage(err)
                            }
                            finishedImage()
                        }) //End: Eachseries coordinates
            }, function(err) {
                if (err) {
                    return deferred.reject(err)
                }
                // console.log('LINE 199! tags:', results)
                deferred.resolve(results)
            }) //End: Eachseries images
    } //end of else
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
        // console.log('getTags: options.qs: ' + JSON.stringify(options.qs))
    var tags = []
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
            var limit = 10
            async.whilst(
                function() {
                    return (results.status == 'not completed' && tries < limit);
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
                        if (body.status == 'skipped') {
                            return deferred.reject(body.status)
                        }
                        if (body.status == 'completed') {
                            results.status = 'completed';
                            description = body.name;
                            console.log('Cloudsight Tag: ', body)
                                //TODO: Filter out common words
                            var uncommonArray = parseTags(body.name, common)
                            tags.push(uncommonArray);
                        } //END OF BODY.STATUS COMPLETED
                    })
                    tries++;
                    console.log(tries + "/" + limit + " tries.")
                    setTimeout(callback, 3000);
                },
                function(err) {
                    if (err) {
                        return deferred.reject(err)
                    }
                    // console.log('Exited async whilst, tags: ', tags)
                    if (tags.length > 0) {
                        deferred.resolve(tags)
                    } else {
                        deferred.reject('no tags found')
                    }
                }); //END OF ASYNC WHILST

        }) //END OF CLOUDSIGHT REQUEST
    return deferred.promise
}

function updateDB(landmarkID, tags) {
    // tags is ['man','red','striped','sweater']
    // or [['womens','blue'],['jacket','mens']]
    if (Object.prototype.toString.call(tags[0]) === '[object Array]') {
        tags = _.flatten(tags);
    }
    var colors = colorHex(tags);
    tags = _.difference(tags, colors);
    tags = eliminateDuplicates(tags);
    colors = eliminateDuplicates(colors)
    var deferred = q.defer();
    db.Landmarks.findOne({
        _id: landmarkID
    }, function(err, landmark) {
        if (err) deferred.reject(err)
        if (landmark) {
            tags.forEach(function(tag) {
                landmark.itemTags.text.push(tag)
            })
            colors.forEach(function(color) {
                landmark.itemTags.colors.push(color)
            })

            //Eliminate dupes again for already existing user inputted tags
            tags = eliminateDuplicates(tags);
            colors = eliminateDuplicates(colors);

            landmark.save(function(err, saved) {
                if (err) console.log(err)
                    //console.log('Updated landmark:', saved)
                deferred.resolve(saved);
            })
        } else {
            deferred.reject()
        }
    })
    return deferred.promise;
}


function parseTags(sentence, common) {
    sentence = sentence.replace(/'/g, "");

    var wordArr = sentence.match(/\w+/g),
        commonObj = {},
        uncommonArr = [],
        word, i, uniqueArray = []
    var uniqueArray = eliminateDuplicates(wordArr)
    common = common.split(',');
    for (i = 0; i < common.length; i++) {
        commonObj[common[i].trim()] = true;
    }
    for (i = 0; i < uniqueArray.length; i++) {
        word = uniqueArray[i].trim().toLowerCase();
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

function colorHex(tags) {
    var hexCodes = [{
        'red':'#ea0000'
    }, {
        'orange': '#f7a71c'
    }, {
        'yellow': '#fcda1f'
    }, {
        'green': '#89c90d'
    }, {
        'aqua': '#7ce9ed'
    }, {
        'blue': '#00429c'
    }, {
        'purple': '#751ed7'
    }, {
        'pink': '#f75dc4'
    }, {
        'white': '#ffffff'
    }, {
        'grey': '#999999'
    }, {
        'black': '#000000'
    }, {
        'brown': '#663300'
    }]
    var colors = []
    hexCodes.forEach(function(hash) {
        for (var key in hash) {
            if (hash.hasOwnProperty(key)) {
                tags.forEach(function(tag) {
                    if (key.trim() == tag.trim()) {
                        colors.push(hash[key]);
                    }
                })
            }
        }
    })
    return colors
}

function eliminateDuplicates(arr) {
    var i,
        len = arr.length,
        out = [],
        obj = {};

    for (i = 0; i < len; i++) {
        obj[arr[i]] = 0;
    }
    for (i in obj) {
        out.push(i);
    }
    return out;
}


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