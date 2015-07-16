//TODO: AUTO CROP IMAGES BASED ON FOCAL POINT

var mongoose = require('mongoose'),
    _ = require('underscore'),
    db = require('../../components/IF_schemas/db'),
    redis = require('redis'),
    client = redis.createClient(),
    request = require('request'),
    async = require('async'),
    opencv = require('../ImageProcessing/OpenCVJavascriptWrapper/index.js'),
    q = require('q'),
    fs = require('fs'),
    im = require('imagemagick'),
    crypto = require('crypto'),
    AWS = require('aws-sdk');

client.on("connect", function(err) {
    console.log("Connected to redis");
});


var timer = new InvervalTimer(function() {
    client.lrange('scraped', 0, -1, function(err, items) {
            console.log('Queue: ' + items.length)
            if (items.length > 0) {
                console.log('Pausing timer')
                timer.pause();
                console.log(items.length + ' item(s) for processing.')
                async.mapSeries(items, function(item) {
                    var item = item.toString().trim()
                    async.waterfall([
                            //Retrieve imgURL from landmark
                            function(callback) {
                                getImageUrl(item).then(function(url) {
                                    console.log('Retrieved image ..')
                                    callback(null, url)
                                }, function(err) {
                                    console.log('getImageUrl error.', item)
                                    callback(err)
                                })
                            },
                            //Find items in OpenCV
                            function(url, callback) {
                                opencv.findItemsInImage(url, function(err, data) {
                                    if (err) {
                                        return callback(err)
                                    }
                                    var coords = data.items[0];
                                    if (coords == null || (coords && coords.length < 1)) {
                                        console.log('OpenCV did not find coordinates.')
                                        return callback(err)
                                    }
                                    callback(null, url, data)
                                })
                            },
                            //Crop image
                            function(url, data, callback) {
                                cropImage(url, data).then(function(images) {
                                    console.log('Finished cropping image.')
                                    callback(null, images)
                                }).catch(function(err) {
                                    console.log('Cropping error: ', err)
                                    callback(null, null)
                                })
                            },
                            //Process image through cloudsight
                            function(images, callback) {
                                cloudSight(images).then(function(tags) {
                                    // console.log('cloudSight finished.', tags)
                                    callback(null, tags)
                                }).catch(function(err) {
                                    console.log('cloudSight error.', err)
                                    if (err == 'no tags found') {
                                        //Remove from redis queue
                                        client.lrem('scraped', 1, snap_str);
                                        timer.resume()
                                    }
                                })
                            },
                            //Update and save landmark
                            function(tags, callback) {
                                updateDB(item, tags).then(function(item) {
                                    console.log('Saved!', item)
                                    callback(null)
                                }).catch(function(err) {
                                    console.log('Save error.', err)
                                    callback(err)
                                })
                            }
                        ],
                        //Item is done processing
                        function(err, results) {
                            if (err) console.log('72 Error: ', err)
                                //Remove from redis queue
                            client.lrem('scraped', 1, item);
                            timer.resume()
                        });
                }, function(err, results) {
                    //all items are done processing
                    console.log('Resuming timer!')
                    timer.resume()
                });
            }
        }) // end of client lrange, callback)
}, 5000);

//HELPER FUNCTIONS
function cropImage(url, data) {
    var deferred = q.defer();
    var croppedImages = [];
    var coords = data.items[0];
    //Limit objects in image to 2 max
    if (coords.length >= 2) {
        coords = coords.splice(0, 2)
    }
    async.eachSeries(coords, function iterator(coord, callback) {
            var hash = crypto.createHash('md5')
            var filename = hash + '.jpg'
            var tempPath = "IF_services/redis/temp/" + filename
            request(url, {
                encoding: 'binary'
            }, function(err, response, body) {
                if (err) {
                    return callback(err)
                }
                fs.writeFile(tempPath, body, 'binary', function(err) {
                    if (err) {
                        return callback(err)
                    }
                    im.identify(tempPath, function(err, features) {
                        if (err) {
                            return callback(err)
                        }
                        console.log('Image features: ', features);
                        // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
                        //Crop the image
                        im.convert([tempPath, '-crop', coord[2] + 'x' + coord[3] + '+' + coord[1] + '+' + coord[2], tempPath], function(err, stdout, stderr) {
                                if (err) {
                                    return callback(err)
                                }
                                fs.readFile(tempPath, function(err, fileData) {
                                    if (err) {
                                        return callback(err)
                                    }
                                    var s3 = new AWS.S3();
                                    var date = (new Date().getUTCFullYear()) + "/" + (new Date().getUTCMonth()) + "/"
                                    var awsKey = date + filename
                                    s3.putObject({
                                        Bucket: 'if-server-general-images',
                                        Key: awsKey,
                                        Body: fileData,
                                        ACL: 'public-read'
                                    }, function(err, data) {
                                        if (err) {
                                            return callback(err)
                                        }
                                        croppedImages.push("https://s3.amazonaws.com/if-server-general-images/" + awsKey)
                                        fs.unlink(tempPath);
                                        callback()
                                    });
                                }); //end of readfile
                            }) //end of convert
                    }); // end of identify
                }); // end of writefile
            }); //end of request
        },
        function done(err) {
            if (err) {
                return deferred.reject(err)
            }
            deferred.resolve(croppedImages)
        });
    return deferred.promise
}

function cloudSight(images, data) {
    var deferred = q.defer();
    var qs = {};
    var results = []
    async.eachSeries(images, function iterator(img, finishedRequest) {
        qs = {
            'image_request[remote_image_url]': img,
            'image_request[locale]': 'en-US',
            'image_request[language]': 'en'
        }
        getTags(qs).then(function(tags) {
            results = results.concat(tags);
            finishedRequest()
        }).catch(function(err) {
            if (err) {
                console.log('No tags found for this focal point.')
                return finishedRequest()
            }
            finishedRequest()
        })
    }, function(err) {
        if (err) {
            return deferred.reject(err);
        }
        console.log('Finished looking for tags..', results)
        if (results.length < 1) {
            return deferred.reject('No Tags found.')
        } else if (results == undefined) {
            return deferred.reject('No tags found')
        } else {
            deferred.resolve(results)
        }
    }); //End of eachseries
    return deferred.promise;
}

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
                            var uncommonArray = parseTags(body.name)
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
    var categories = categorize(tags);
    //Get rid of color or category tags in tags
    tags = _.difference(tags, colors);
    tags = _.difference(tags, categories);
    //Eliminate dupes
    tags = eliminateDuplicates(tags);
    colors = eliminateDuplicates(colors);
    categories = eliminateDuplicates(categories);
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
            categories.forEach(function(category) {
                landmark.itemTags.categories.push(category)
            })

            //Eliminate dupes again for already existing tags
            landmark.itemTags.text = eliminateDuplicates(landmark.itemTags.text);
            landmark.itemTags.colors = eliminateDuplicates(landmark.itemTags.colors);
            landmark.itemTags.categories = eliminateDuplicates(landmark.itemTags.categories);

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

function parseTags(sentence) {
    var common = "the,it,is,a,an,and,by,to,he,she,they,we,i,are,to,for,of,with"
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

// outerwear, dresses, tops, skirts, pants, underwear, activewear (formerly swimwear), tights & leggings, shoes, bags, accessories, jewelry


function categorize(tags) {

    var snapCategories = [];
    var categories = [{
        'Tops': [
            'top',
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
    }, {
        'Dresses': [
            'dress',
            'sundress',
            'wedding',
            'maxi',
            'gown',
            'bubble',
            'tiered',
            'corset',
            'tea',
            'teadress',
            'wrap',
            'wrapdress',
            'blouson',
            'halter',
            'babydoll',
            'bodycon'
        ]
    }, {
        'Outerwear': [
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
    }, {
        'Pants': [
            'shorts',
            'pants',
            'pant',
            'jeans',
            'jean',
            'trousers',
            'trouser',
            'chaps',
            'cargo',
            'capri',
            'palazzo',
            'palazzos',
            'chinos',
            'chino',
            'khaki',
            'khakis',
            'overalls',
            'yoga-pants',
            'yogapants',
            'lowrise',
            'lowrise-pants',
            'lowrisepants',
            'sweatpants',
            'sweat-pants',
            'parachute',
            'phat',
            'pedal-pushers',
            'pedalpushers',
            'dresspants',
            'dress-pants',
            'bellbottoms',
            'bell-bottoms',
            'cycling',
            'highwater',
            'high-water',
            'bermuda',
            'windpants',
            'wind-pants'
        ]
    }, {
        'Shoes': [
            'shoe',
            'shoes',
            'sneaker',
            'sneakers',
            'boot',
            'boots',
            'slipper',
            'slippers',
            'sandal',
            'sandals',
            'spat',
            'spats',
            'croc',
            'crocs',
            'dress-shoes',
            'boot',
            'boots',
            'flip-flops',
            'flip-flop',
            'sandal',
            'heels',
            'high-heels',
            'highheels'
        ]
    }, {
        'Skirts': [
            'skirt',
            'miniskirt',
            'mini-skirt',
            'a-line',
            'aline',
            'aline-skirt',
            'ballerina',
            'ballerina-skirt',
            'denimskirt',
            'denim-skirt',
            'jobskirt',
            'job-skirt',
            'job',
            'microskirt',
            'micro-skirt',
            'pencil-skirt',
            'pencilskirt',
            'praire',
            'praire-skirt',
            'praireskirt',
            'rah-rah',
            'rahrah',
            'tutu',
            'wrap-skirt',
            'wrapskirt',
            'leatherskirt',
            'leather-skirt'
        ]
    }, {
        'Bags': [
            'backpack',
            'handbag',
            'hand-bag'
            'handbags',
            'chanel',
            'duffel',
            'satchel',
            'tote',
            'messenger',
            'saddle',
            'clutch',
            'wristlet'
        ]
    }, {
        'Accessories': [
            'sunglasses',
            'watch',
            'wristwatch',
            'scarf',
            'sash',
            'headband',
            'glasses',
            'cufflink',
            'tie',
            'necktie',
            'bow',
            'bowtie',
            'belt',
            'bandana',
            'suspenders',
            'wallet'
        ]
    }, {
        'Activewear': [
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
            'surf',
            'trunks',
            'bikini',
            'boardshorts',
            'board',
            'drysuit',
            'dry',
            'one-piece',
            'onepiece',
            'rashguard',
            'rash',
            'yoga',
            'sports'
        ]
    }, {
        'Jewelry': [
            'earrings',
            'earring',
            'necklace',
            'ring',
            'brooch',
            'brooches',
            'bracelet',
            'bracelets',
            'amethyst',
            'emerald',
            'jade',
            'jasper',
            'ruby',
            'sapphire',
            'diamond',
            'gold'
        ]
    }, {
        'Underwear': [
            'underwear',
            'underpants',
            'boxers',
            'briefs',
            'boxer',
            'brief',
            'panties',
            'slip',
            'hoisery',
            'bra',
            'bras'
        ]
    }, {
        'Tights & Leggings': [
            'tights',
            'leggings',
            'legging'
        ]
    }]
    categories.forEach(function(category) {
        for (var key in category) {
            if (category.hasOwnProperty(key)) {
                tags.forEach(function(tag) {
                    for (var i = 0; i < category[key].length; i++) {
                        if (category[key][i].trim() == tag.trim()) {
                            snapCategories.push(key);
                        }
                    }
                })
            }
        }
    })
    return snapCategories
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