// TODO: 
// Hard code: Seasons, maybe Colors
// Choose appropriate array in returned synonym data depending on category arg
// Hard Adjective Check
// 

var mongoose = require('mongoose'),
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
    Promise = require('es6-promise').Promise,
    fs = require('fs'),
    client = require('../../../redis.js');

var mongoStream = db.EbayItems
    .find({})
    .sort({
        '_id': 1
    })
    .skip(500)
    .limit(5)
    .lean()
    .stream();

var data = {
    images: []
}

mongoStream.on('data', function(item) {
    client.rpush('train', JSON.stringify(item), function(err, reply) {
        if (err) {
            err.niceMessage = 'Could not save item';
            err.devMessage = 'REDIS QUEUE ERR';
            console.log(err)
        }
    });

})

mongoStream.on('end', function() {
    // console.log('\n\nStream ended.\n\n')
})


var timer = new InvervalTimer(function() {
    client.lrange('train', 0, -1, function(err, items) {
            //## Uncomment below and run file to clear redis queue
            // console.log('clearing list..')
            // client.ltrim('train',1,0)
            console.log('Queue: ' + items.length)
            if (items.length > 0) {
                // console.log('Pausing timer')
                timer.pause();
                console.log(items.length + ' item(s) for processing.')
                async.eachSeries(items, function(item_str, finishedItem) {
                    item = JSON.parse(item_str)
                    parseItem(item).then(function() {
                        console.log('\n ---- next item ----  \n')
                        client.lrem('train', 1, item_str);
                        timer.resume()
                        finishedItem()
                    })
                }, function finishedItems(err, results) {
                    //all snaps are done processing
                    // console.log('Resuming timer!')
                    timer.resume()
                });
            }
        }) // end of client lrange, callback)
}, 2000);


function parseItem(item) {
    return new Promise(function(resolve, reject) {
        // console.log('item.name: ', item.images.length);
        console.log('Starting...')
        var obj = {
            captions: [],
            file_path: ''
        }
        var filename = urlify(item.itemId + (new Date().toString())) + ".png"
            // console.log('filename: ',filename)
        var path = __dirname + "/temp/" + filename;
        obj.file_path = path;
        var brand, material, gender, size, color, season, style = {}
        var details = [brand, material, gender, size, color, season, style]
        var variables = [];
        var absolutes = [];
        item.details.forEach(function(detail) {
            switch (detail.Name) {
                case 'Brand':
                    brand = {
                        Name: 'Brand',
                        Value: detail.Value[0]
                    }
                    absolutes.push(brand)
                    break;
                case 'Material':
                    material = {
                        Name: 'Material',
                        Value: detail.Value[0]
                    }
                    absolutes.push(material)
                    break;
                case 'Gender':
                    gender = {
                        Name: 'Gender',
                        Value: detail.Value[0]
                    }
                    absolutes.push(gender)
                    break;
                case 'Size':
                    size = {
                        Name: 'Size',
                        Value: detail.Value[0]
                    }
                    absolutes.push(size)
                    break;
                case 'Color':
                    color = {
                        Name: 'Color',
                        Value: detail.Value[0]
                    }
                    variables.push(color)
                    break;
                case 'Season':
                    season = {
                        Name: 'Season',
                        Value: detail.Value[0]
                    }
                    variables.push(season)
                    break;
                case 'Style':
                    style = {
                        Name: 'Style',
                        Value: detail.Value[0]
                    }
                    absolutes.push(style)
                    break;
            }
        })

        console.log('\nVariables: ', variables, '\nAbsolutes: ', absolutes, '\n')
        var firstIteration = item.name;
        absolutes.forEach(function(detail) {
            if (item.name.indexOf(detail.Value.trim()) == -1) {
                // console.log('Adding detail: ', detail.Name, detail.Value[0])
                firstIteration = firstIteration.concat(' ' + detail.Value)
            }
        })
        variables.forEach(function(detail) {
                if (detail) {
                    // console.log('Adding detail: ', detail.Name, detail.Value[0])
                    firstIteration = firstIteration.concat(' ' + detail.Value)
                }
            })
            // console.log('\nOriginal: ', firstIteration, '\n')
        var secondIteration = firstIteration;
        var tokens = secondIteration.split(' ');
        if (variables.length !== 0) {
            var exchangables = []
            async.eachSeries(variables, function iterator(variable, finishedVariable) {
                    var word = variable.Value

                    if (word.split(' ').length > 1) {
                        if (variable.Name == 'Material') {
                            console.log('127')
                            word = word.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '');
                        } else {
                            console.log('Input is longer than one word, skipping: ', word)
                            return finishedVariable()
                        }
                    }
                    // console.log('***', word)
                    if (word.length <= 2) {
                        console.log('Not a word skipping', word)
                        return finishedVariable()
                    }
                    // word = word.replace(/'s/g, ''); //get rid of 's stuff (apostrophes and plurals, like "women's" or "men's". this removes the 's)
                    word = word.replace(/[^\w\s]/gi, ''); //remove all special characters
                    word = word.replace(/\s+/g, ' ').trim(); //remove extra spaces from removing chars

                    checkWord(word).then(function(res1) {
                        var bool = res1.isWord
                        if (bool == 'true') {
                            getSynonyms(word, variable.Name).then(function(res2) {
                                var results = res2
                                if (results.synonyms && results.synonyms.length > 0) {
                                    exchangables.push(results)
                                } else {
                                    console.log('No synonyms found.')
                                }
                                finishedVariable()
                            })
                        } else {
                            console.log('Not exchangable.')
                            finishedVariable()
                        }
                    })
                },
                function finishedVariables(err) {
                    if (err) console.log('167: ', err)
                        // console.log('173')
                    exchangables = _.uniq(exchangables, 'original')
                    async.eachSeries(tokens, function iterator(token, finishedToken) {
                            token = token.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '')
                            if (token && STOP_WORDS.join(' ').indexOf(token.toLowerCase().trim()) > -1) {
                                // console.log('This token is untouchable: ', token)
                                return finishedToken()
                            }
                            if (absolutes.map(function(o) {
                                    return o.Value
                                }).join(' ').indexOf(token.trim()) > -1) {
                                return finishedToken()
                            }

                            checkWord(token).then(function(res) {
                                var bool = res.isWord
                                if (bool == 'true') {
                                    getSynonyms(token).then(function(results) {
                                        if (results.synonyms && results.synonyms.length > 0) {
                                            exchangables.push(results)
                                        }
                                        finishedToken()
                                    })
                                } else {
                                    finishedToken()
                                }
                            })
                        },
                        function finishedTokens(err) {
                            if (err) console.log('167: ', err);
                            exchangables = _.uniq(exchangables, 'original')
                                // console.log('Final Exchangeable results: ', exchangables)
                            exchangables.forEach(function(replacement) {
                                if (secondIteration.indexOf(replacement.original) > -1) {
                                    secondIteration = secondIteration.replace(replacement.original, replacement.synonyms[0])
                                }
                            })
                            console.log('\nFirst iteration: ', firstIteration)
                            console.log('\nSecond Iteration: ', secondIteration, '\n')
                            var captions = [firstIteration, secondIteration]
                            return resolve(captions)
                        })
                })

        } else {

            if (tokens && tokens.length > 0) {
                async.eachSeries(tokens, function iterator(token, finishedToken) {
                        token = token.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '')
                        if (token && STOP_WORDS.join(' ').indexOf(token.toLowerCase().trim()) > -1) {
                            // console.log('This token is untouchable: ', token)
                            return finishedToken()
                        }
                        if (absolutes.length > 0 && absolutes.map(function(o) {
                                return o.Value
                            }).join(' ').indexOf(token.trim()) > -1) {
                            return finishedToken()
                        }

                        checkWord(token).then(function(res) {
                            var bool = res.isWord
                            if (bool == 'true') {
                                getSynonyms(token).then(function(results) {
                                    if (results.synonyms && results.synonyms.length > 0) {
                                        exchangables.push(results)
                                    } else {
                                        console.log('No synonyms found.')
                                    }
                                    finishedToken()
                                })
                            } else {
                                finishedToken()
                            }
                        })
                    },
                    function finishedTokens(err) {
                        if (err) console.log('167: ', err)
                        exchangables = _.uniq(exchangables, 'original')
                        console.log('Exchangables: ', exchangables)
                        exchangables.forEach(function(replacement) {
                            if (secondIteration.indexOf(replacement.original) > -1) {
                                secondIteration = secondIteration.replace(replacement.original, replacement.synonyms[0])
                            }
                        })
                        console.log('\nFirst iteration: ', firstIteration)
                        console.log('\nSecond Iteration: ', secondIteration, '\n')
                        return resolve()
                    })
            }
        }
    })
}

function checkWord(word) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'http://localhost:5000/check',
            body: word
        }
        request.post(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                body = JSON.parse(body)
                    // console.log('Result: ', body)
                resolve(body)
            } else {
                if (err) {
                    console.log('133', err)
                }
                resolve(body)
            }
        });
    })
}

function compareWords(word1, word2) {
    return new Promise(function(resolve, reject) {
        var data = {
            first: word1,
            second: word2
        }
        var options = {
            url: 'http://localhost:5000/compare',
            json: true,
            body: data
        }
        request.post(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                // body = JSON.parse(body)

                body.results = body.results.filter(function(set) {
                    return set.target.toLowerCase().trim() !== word1.toLowerCase().trim()
                })

                body.results = body.results.filter(function(set) {
                    return set.score > 0.05
                })

                body.results.forEach(function(set) {
                    set.target = set.target.split("Synset(")[1].split("')")[0].split('.')[0].replace(/[^\w\s]/gi, '')
                })

                

                body.results = _.sortBy(body.results, function(n) {
                    return n.score;
                });

                // body.results = body.results.filter(function(set) {
                //     return set.first.toLowerCase().trim() == word1.toLowerCase().trim()
                // })
                console.log('\n\n\nTarget: ',word1,'\n', body)
                resolve(body)
            } else {
                if (err) {
                    console.log('133', err)
                }
                resolve(body)
            }
        });
    })
}


function getSynonyms(word, category) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'http://localhost:5000/syn',
            body: word
        }
        request.post(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                body = JSON.parse(body)

                // if (category) {
                //     switch (category) {
                //         case 'Season':
                //             //do stuff
                //              // console.log('\n\n\nTargeted synonyms: ',body.synonyms[4])

                //             break;
                //         case 'Color':
                //             break
                //     }
                // }

                body.synonyms = _.flatten(body.synonyms)
                body.synonyms = _.uniq(body.synonyms)
                body.synonyms.splice(0, 1)
                body.synonyms = body.synonyms.filter(function(word) {
                    return (word.toLowerCase().trim().indexOf(body.original.toLowerCase().trim()) == -1)
                })
                body.synonyms = body.synonyms.map(function(word) {
                    return (word.charAt(0).toUpperCase() + word.slice(1)).replace(/_/g, '');
                })

                async.eachSeries(body.synonyms, function iterator(word, cb) {
                    compareWords(body.original, word).then(function() {
                        wait(cb, 1000)
                    })
                }, function done() {

                })

                // console.log('Wordnet result for ', body.original,' : ',body.synonyms)
                resolve(body)
            } else {
                if (err) {
                    console.log('133', err)
                }
                resolve(body)
            }
        });
    })
}


function convertBase64(image) {
    return new Promise(function(resolve, reject) {
        // console.log('getting here: ',image)
        //Detect if the passed image is base64 already or a URI
        var base64Matcher = new RegExp("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$");
        if (base64Matcher.test(image)) {
            console.log('yep')
            resolve(image)
        } else {
            request({
                url: image,
                encoding: 'base64'
            }, function(err, res, body) {
                if (!err && res.statusCode == 200) {
                    var base64prefix = 'data:' + res.headers['content-type'] + ';base64,';
                    resolve(body)
                } else {
                    if (err) {
                        console.log(err.lineNumber + err)
                    }
                    console.log('body: ', body)
                    reject('Cannot download image.')
                }
            });
        }
    })
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

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}


STOP_WORDS = [
    'boy',
    'girl',
    'boys',
    'girls',
    'mens',
    'womens',
    'men',
    'women',
    'baby',
    'man',
    'woman',
    'toddler',
    'ladies',
    'lady',
    'guys',
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
    'turtle-neck',
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
    'bodycon',
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
    'fleece',
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
    'shrug',
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
    'wind-pants',
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
    'highheels',
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
    'leather-skirt',
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
    'wristlet',
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
    'wallet',
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
    'sports',
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
    'gold',
    'brassiere',
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
    'bras',
    'tights',
    'leggings',
    'legging'
]