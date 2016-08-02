//-------Notes------//
//Must have /IF_services/ImageProcessing/webserver.py open for this to work


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
    AWS = require('aws-sdk'),
    uniquer = require('../uniquer.js');

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
                    console.log(item)
                    async.waterfall([
                            //Retrieve imgURL from landmark
                            function(callback) {
                                getImageUrl(item).then(function(url) {
                                    console.log('Retrieved images ..')
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
                                    // console.log('data: ', data)
                                    var objects = data.items
                                    callback(null, url, objects)
                                })
                            },
                            //Process image through cloudsight
                            function(url, objects, callback) {
                                cloudSight(url, objects).then(function(tags) {
                                    // console.log('cloudSight finished.', tags)
                                    callback(null, url, objects, tags)
                                }).catch(function(err) {
                                    console.log('cloudSight error.', err)
                                    //Remove from redis queue
                                    client.lrem('scraped', 1, item);
                                    timer.resume()
                                })
                            },
                            //Crop image
                            function(url, objects, tags, callback) {
                                cropImage(url, objects, tags).then(function(images) {
                                    console.log('Finished cropping image: ',images)
                                    if (images.length < 1) {
                                        return callback(null, url, null, tags)
                                    }
                                    callback(null, url, images, tags)
                                }).catch(function(err) {
                                    console.log('Cropping error: ', err)
                                    callback(null, url, null, tags)
                                })
                            },
                            //Update and save landmark
                            function(url, images, tags, callback) {
                                if (images && images.length > 1) {
                                    var newItems = [];
                                    for (var i = 0; i < tags.length; i++) {
                                        var newItem = {
                                            tags: tags[i],
                                            originalImage: url
                                        }
                                        newItem.image = (i == 0) ? images[1] : images[0];

                                        newItem.tags = newItem.tags[0]
                                        newItems.push(newItem)
                                    }
                                }
                                var update = (images && images.length > 1) ? newItems : null
                                updateDB(update, item,tags).then(function(item) {
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

function cropImage(url, objects, tags) {
    // console.log('inside cropImage url: ',url)
    var deferred = q.defer();
    var croppedImages = [];
    var coords = objects[0].coords
    if (coords.length <= 1) {
        deferred.reject('No coordinates')
    }
    //Limit objects in image to 2 max
    if (coords.length >= 2) {
        coords = coords.splice(0, 2)
    }
    var croppedImages = [];
    async.eachSeries(coords, function iterator(coord, callback) {
            var stuff = Math.random().toString(36).replace(/[^a-z]+/g, '')
            var hash = crypto.createHash('md5').update(stuff).digest('hex');
            var filename = hash + '.jpg'
            var tempPath = "/tmp/" + filename
            request(url[0], {
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
                        console.log('Image features: ', features['page geometry']);
                        var width = parseInt(features['page geometry'].split('x')[0])
                        var height = parseInt(features['page geometry'].split('x')[1].split('+')[0])
                            // console.log('width: ',width,' height: ',height, 'coord[0',coord[0],'coord[1]',coord[1],'coord[2]',coord[2],'coord[3]',coord[3])
                            // width:  450  height:  450 coord[0 389 coord[1] 249 coord[2] 46 coord[3] 56
                        if (coord[0] < (width * .6)) {
                            console.log('CROPS ARE NOT BIG ENOUGH', coord[0],width,coord[1],height)
                            return callback(err)
                        } 
                        //Crop the image
                        im.convert([tempPath, '-crop', coord[0] + 'x' + coord[1] + '+' + coord[2] + '+' + coord[3], tempPath], function(err, stdout, stderr) {
                                if (err) {
                                    return callback(err)
                                }
                                fs.readFile(tempPath, function(err, fileData) {
                                    if (err) {
                                        return callback(err)
                                    }
                                    var s3 = new AWS.S3();
                                    var awsKey = filename;
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



function updateDB(newItems, landmarkID,tags) {
    console.log('inside updateDB.. newItems: ', newItems)
    //First update original item by adding cloudsighted tags.
    var allTags = [];
    if (newItems !== null) {
        newItems.forEach(function(item) {
            allTags = allTags.concat(item.tags)
        })
    } else {
        allTags = tags[0][0]
    }
    var colors = colorHex(allTags);
    var categories = categorize(allTags);
    //Get rid of color or category tags in tags
    allTags = _.difference(allTags, colors);
    allTags = _.difference(allTags, categories);
    //Eliminate dupes
    allTags = eliminateDuplicates(allTags);
    colors = eliminateDuplicates(colors);
    categories = eliminateDuplicates(categories);
    var deferred = q.defer();
    db.Landmarks.findOne({
        _id: landmarkID
    }, function(err, landmark) {
        if (err) return deferred.reject(err)
        if (landmark) {
            allTags.forEach(function(tag) {
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
            landmark.save(function(err, original) {
                if (err) return deferred.reject(err)
                console.log('Updated landmark:', original)
                if (!newItems) return deferred.resolve()
                    //For each new item create a landmark in db
                if (newItems !== null) {
                    async.eachSeries(newItems, function Iterator(newItem, done) {
                        var instagram = new db.Landmark();
                        //TODO: Change the coordinates to location of where instagram was taken
                        instagram.loc = original.loc;
                        instagram.source_instagram_post = original.source_instagram_post;
                        instagram.itemImageURL.push(newItem.originalImage);
                        instagram.itemImageURL.push(newItem.image);
                        var colors = colorHex(newItem.tags)
                        var categories = categorize(newItem.tags)
                        var text = _.difference(newItem.tags, colors);
                        text = _.difference(newItem.tags, categories);
                        //Eliminate dupes
                        text = eliminateDuplicates(text);
                        colors = eliminateDuplicates(colors);
                        categories = eliminateDuplicates(categories);
                        instagram.itemTags.text = text;
                        instagram.itemTags.colors = colors;
                        instagram.itemTags.categories = categories;
                        //TODO: Random name generation, for now, Princess Peach
                        var name = 'Princess Peach' + Math.floor(1000 + Math.random() * 9000).toString()
                        uniquer.uniqueId(name, 'Landmarks').then(function(id) {
                            instagram.id = id;
                            instagram.save(function(err, saved) {
                                if (err) {
                                    return deferred.reject(err)
                                }
                                console.log('New item created!: ', saved)
                                done()
                            })
                        })
                    }, function(err) {
                        deferred.resolve()
                    })
                } //end of if newItems is array
            })
        } else {
            deferred.reject()
        }
    })
    return deferred.promise;
}



function cloudSight(imgArray, objects) {
    var deferred = q.defer();
    var qs = {};
    var results = []
    var items = objects
    var i = 0;
    async.eachSeries(imgArray, function iterator(img, done) {
        if (items == undefined || items == null) {
            console.log('OpenCV did not find coordinates..', JSON.stringify(items))
            return done()
        }
        var item = items[i]
        var failCount = 0
        i++;
        console.log('Processing image: ' + i + '/' + (imgArray.length))
            //----If OpenCV Image processing does not return coordinates----//
        if (item == null || item.coords == null || (item.coords && item.coords.length < 1)) {
            console.log('OpenCV did not find coordinates.', JSON.stringify(item))
            qs = {
                'image_request[remote_image_url]': img,
                'image_request[locale]': 'en-US',
                'image_request[language]': 'en'
            }
            getTags(qs).then(function(tags) {
                console.log('Tags: ', tags)
                results[i] = tags
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
                    results.push(tags);
                    // console.log('Line 259 TAGS!! : ', tags)
                    finishedRequest()
                }).catch(function(err) {
                    if (err) {
                        console.log('163 Error: ', err)
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
                    console.log('177 Error: ', err)
                    return done()
                }
                done()
            });
        } //End of if coords found
    }, function(err) {
        if (err) {
            console.log('Finished Error: ', err)
                // deferred.reject(err);
        }
        console.log('Finished looking for tags..', results)
        if (results.length < 1) {
            return deferred.reject('No Tags found.')
        } else if (results == undefined) {
            return deferred.reject('No tags found')
        } else {
            deferred.resolve(results)
        }
    }); //End of each series
    return deferred.promise;
}

function getImageUrl(landmarkID) {
    var deferred = q.defer();
    db.Landmarks.findById(landmarkID, function(err, landmark) {
        if (err) deferred.reject(err)
        if (landmark) {
            if (landmark.itemImageURL.length >= 1) {
                // console.log('landmark.itemImageURL: ', landmark)
                //First img only for now, change later
                deferred.resolve(landmark.itemImageURL)
            } else {
                console.log('id: ', landmarkID, ' landmark: ', landmark)
                deferred.reject('No imgURL found in snap')
            }
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
                    if (tags.length > 0) {
                        deferred.resolve(tags)
                    } else {
                        deferred.reject('no tags found')
                    }
                }); //END OF ASYNC WHILST

        }) //END OF CLOUDSIGHT REQUEST
    return deferred.promise
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
            'cardigan',
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
            'hand-bag',
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