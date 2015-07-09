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

//Periodically retreives landmark ID from redis queue,
//processes it for tags 
//and updates and saves landmark
setInterval(function() {
    client.lrange('snaps', 0, -1, function(err, snaps) {
        console.log(snaps.length, ' items for processing.')
        snaps.map(function(snap_str) {
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
                            if (err) {
                                console.log('opencv error: ', err)
                                callback(err)
                            }
                            //data is {items: [[xcenter,ycenter]]}
                            callback(null, url, data)
                        })
                    },
                    function(url, data, callback) {
                        //Process image through cloudsight
                        cloudSight(url, data).then(function(tags) {
                            callback(null, tags)
                        }, function(err) {
                            console.log('cloudSight error.', err)
                            callback(err)
                        })
                    },
                    function(tags, callback) {
                        //Update and save landmark
                        updateDB(snap, tags).then(function(snap) {
                            console.log('Saved!', snap)
                            callback(null)
                        }, function(err) {
                            console.log('Save error.', err)
                            callback(err)
                        })
                    }
                ],
                //Final callback
                function(err, results) {
                    console.log('Error: ', err)
                        //Remove from redis queue
                    client.lrem('snaps', 1, snap_str, redis.print);
                });
        });
    });
}, 4000);


//HELPER FUNCTIONS
function getImageUrl(landmarkID) {
    var deferred = q.defer();
    db.Landmarks.findById(landmarkID, function(err, landmark) {
        if (err) deferred.reject(err)
        if (landmark) {
            if (landmark.source_instagram_post.img_url){
                deferred.resolve(img_url)
            } else if (landmark.itemImageURL.length > 0){
                //First img only for now, change later
                deferred.resolve(landmark.itemImageURL[0])
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
    var tags = []
    async.eachSeries(data.items, function iterator(item, done) {

        var options = {
            url: "https://api.cloudsightapi.com/image_requests",
            headers: {
                "Authorization": "CloudSight cbP8RWIsD0y6UlX-LohPNw"
            },
            qs: {
                'image_request[remote_image_url]': imgURL,
                'image_request[locale]': 'en-US',
                'image_request[language]': 'en',
                'focus[x]': item[0],
                'focus[y]': item[1]
            }
        }
        request.post(options, function(err, res, body) {
                // console.log(imgURL);
                if (err) console.error(err);
                try {
                    var data = JSON.parse(body);
                } catch (e) {
                    console.error('could not parse cloudsight response');
                    console.error(body);
                    done(e)
                }
                var results = {
                    status: 'not completed'
                };
                var description = '';
                var tries = 0;

                async.whilst(
                    function() {
                        return (results.status == 'not completed' && tries < 10);
                    },
                    function(callback) {
                        var options = {
                            url: "https://api.cloudsightapi.com/image_responses/" + data.token,
                            headers: {
                                "Authorization": "CloudSight cbP8RWIsD0y6UlX-LohPNw"
                            }
                        }
                        request(options, function(err, res, body) {
                            if (err) console.error(err);
                            console.log('cloudsight status is..', body)
                            try {
                                var body_parsed = JSON.parse(body);
                            } catch (e) {
                                console.error('could not parse some cloudsight api call');
                                console.error(body);
                                done(e)
                            }
                            body = body_parsed;
                            if (body.status == 'completed') {
                                results.status = 'completed';
                                description = body.name;
                                console.log('Cloudsight Tag: ', body)
                                    //TODO: Filter out common words
                                var uncommonArray = getUncommon(body.name)
                                tags.push(uncommonArray);
                                done()
                            } //END OF BODY.STATUS COMPLETED
                        })
                        tries++;
                        setTimeout(callback, 5000);
                    },
                    function(err) {
                        done(err)
                    }); //END OF ASYNC WHILST
            }) //END OF CLOUDSIGHT REQUEST
    }, function finished(err) {
        if (err) {
            console.log('Finished Error: ', err)
            deferred.reject(err);
        }
        deferred.resolve(tags)
    }); //End of eachseries
    return deferred.promise;
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