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
                console.log(snaps.length + ' snap(s) for processing.')
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
                                    if (err) console.log('OpenCV Error: ', err)

                                    callback(null, url, data)
                                })
                            },
                            function(url, data, callback) {
                                //Process image through cloudsight
                                cloudSight(url, data).then(function(tags) {
                                    // console.log('cloudSight finished.', tags)
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
                            if (err) console.log('Error: ', err)
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
        // console.log('Data: ', data.items)
    var items = data.items

    var i = 0;

    async.eachSeries(imgURL, function iterator(img, done) {
        if (items == undefined || items == null) {
            console.log('OpenCV did not find coordinates..', JSON.stringify(items))
            return done()
        }
        var item = items[i]
        i++;
        console.log('Processing image:' + i + '/' + (imgURL.length))
            //----If OpenCV Image processing does not return coordinates----//
        if (item == null || item.coords == null || (item.coords && item.coords.length < 1)) {
            console.log('OpenCV did not find coordinates.', JSON.stringify(item))
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
        }
        //----If OpenCV Image processing did not fail----//
        else {
            console.log('OpenCV found coordinates.')
            var lastIndex = item.coords.length
                //Limit focal points to 2 max
            if (lastIndex >= 2) {
                item.coords = item.coords.splice(0, 2)
            }
            console.log(item.coords.length + ' focal point(s) found for current image.')

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
                    results = results.concat(tags);
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
                    return done(err)
                }
                done()
            });
        } //End of if coords found
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
    sentence = sentence.replace(/-/g, "");
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
            } else if (word == 'tshirt') {
                word = 't-shirt'
            }

            uncommonArr.push(word);
        }
    }
    return uncommonArr;
}



function categorize(tags) {
    // Swimwear, Tops, Outerwear,Skirts, Tights & Leggings, Pants, Shoes, Accessories, Underwear, Jewerly
    var categories = [];
    var pants = [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
    ]
    var tightsleggings = [
        'tights',
        'leggings',
    ]
    var skirts = [
        'skirt',
        'miniskirt',
        'mini-skirt',
        'a-line',
        'aline',
        'aline-skirt'
        'ballerina',
        'ballerina-skirt',
        'denimskirt',
        'denim-skirt',
        'jobskirt',
        'job-skirt',
        'job',
        'microskirt',
        'micro-skirt',
        'pencil',
        'pencil-skirt',
        'pencilskirt',
        'praire',
        'praire-skirt',
        'praireskirt',
        'rah-rah',
        'rahrah',
        'tutu',
        'wrap-skirt',
        'wrap',
        'leatherskirt',
        'leather-skirt'
    ]
    var tops = [
        'top',
        'dress',
        'shirt',
        'sweater',
        'tshirt',
        't-shirt',
        'sleeveless',
        'long-sleeve',
        'longsleeve',
        'vest',
        'jersey',
        'dress-shirt',
        'dressshirt',
        'button-down',
        'buttondown',
        'polo',
        'polo-shirt',
        'tank',
        'tanktop',
        'tank-top',
        'blouse',
        'henley',
        'crop',
        'croptop',
        'crop-top',
        'tube',
        'tubetop',
        'tube-top',
        'jeantop',
        'jean-top',
        'halter',
        'haltertop',
        'turtle',
        'turtleneck',
        'turtle-neck'
    ]
    var outerwear = [
        'jacket',
        'coat',
        'blazer',
        'hoodie',
        'suit',
        'windbreaker',
        'parka',
        'leather-jacket',
        'leatherjacket',
        'harrington',
        'harrington-jacket',
        'harringtonjacket',
        'poncho',
        'robe',
        'shawl',
        'tuxedo',
        'overcoat',
        'over-coat',
        'sport-coat',
        'sportcoat',
        'waistcoat',
        'waist-coat',
        'duffle',
        'dufflecoat',
        'duffle-coat',
        'peacoat',
        'pea',
        'britishwarm',
        'british-warm',
        'ulster',
        'ulster-coat',
        'winterjacket',
        'winter-jacket',
        'puffer',
        'puffer-jacket',
        'cagoule',
        'chesterfield',
        'cover-coat',
        'covercoat',
        'duffle-coat',
        'bomber',
        'bomber-jacket',
        'bomberjacket',
        'trench',
        'trenchcoat',
        'trench-coat',
        'rain',
        'raincoat',
        'guardjacket',
        'guard-jacket',
        'mess',
        'mess-jacket',
        'messjacket',
        'opera',
        'operacoat',
        'opera-coat',
        'shrug'
    ]
    var swimwear = [
        'swim',
        'swimwear',
        'swim-wear',
        'swimsuit',
        'swim-suit',
        'swim-briefs',
        'swimbriefs',
        'wet',
        'wetsuit',
        'wet-suit',
        'surfer',
        'surf'
        'trunks',
        'bikini',
        'boardshorts',
        'board',
        'drysuit',
        'dry',
        'one-piece',
        'onepiece',
        'rashguard',
        'rash'
    ]

}

function colorHex(tags) {
    var hexCodes = [{
        'red': '#ea0000'
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