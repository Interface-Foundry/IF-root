// TODO: 
// ***Write images to external AWS Drive (only if you want to run this directly on porygon)
// 
//Captions: For categoryname field splice out 'wholesale'


//IMPORTANT: 
//1. Before running please ensure there is a 'temp' folder in home dir 
//with 2 subdirectories 'test' and 'train'
//2. Run with args 'test' or 'train'. Defaults to 'test'
//3. path variable may be hardcode in order to match folder structure
//of porygon server

//OUTPUT JSON FORMAT: 
// TRAINING:
// [{
//     file_path: 'path/img.jpg',
//     captions: ['a caption', ...]
// }]
// TESTING: 
// [{
//     file_path: 'path/img.jpg'
// }]
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
    Promise = require('bluebird'),
    fs = require('fs'),
    im = require('imagemagick'),
    osHomedir = require('os-homedir'),
    client = require('../../../redis.js'),
    STOP_STRING = require('./stop_words').list.join(' ')

var mongoStream = db.EbayItems
    .find({})
    .sort({
        '_id': -1
    })
    // .skip(700)
    // .limit(50)
    .lean()
    .stream();

var data = []

//'test' mode has only file paths to each image in json
//'train' mode has file path and associated captions
var mode = (process.argv[2] == 'test') ? 'test' : 'train'
var list = (mode == 'test') ? 'test' : 'trainx'
    //Uncomment below and run file to clear redis queue before running.
    // !!Careful with this, Clearing the list when its emplty will sometimes break the list in redis ::shrug::
console.log('clearing list..')
client.ltrim(list, 1, 0)

mongoStream.on('data', function(item) {
    client.rpush(list, JSON.stringify(item), function(err, reply) {
        if (err) {
            err.niceMessage = 'Could not connect to redis client.';
            err.devMessage = 'REDIS QUEUE ERR';
            console.log(err)
        }
    });
})

mongoStream.on('end', function() {})


var timer = new InvervalTimer(function() {
    client.lrange(list, 0, -1, function(err, items) {
        if (items && items.length > 0) {
            // console.log('Queue: ' + items.length)
        }
        if (items.length > 0) {
            timer.pause();
            console.log(items.length + ' item(s) for processing.')
            async.eachSeries(items, function(item_str, finishedItem) {
                item = JSON.parse(item_str)
                processItem(item).then(function() {
                    console.log('\n ---- next item ----  \n')
                    client.lrem(list, 1, item_str);
                    finishedItem()
                        // timer.resume()

                }).catch(function(err) {
                    if (err) console.log(err)
                    finishedItem()
                })
            }, function finishedItems(err, results) {
                timer.resume()
            });
        }
    })
}, 2000);


function processItem(item) {
    return new Promise(function(resolve, reject) {
        console.log('\n\nStarting...', item.name)
        var nodes = []
        async.eachSeries(item.images, function iterator(image, finishedNode) {
            var node = (mode == 'train') ? ({
                captions: [],
                file_path: ''
            }) : ({
                file_path: ''
            });
            var filename = urlify(item.itemId + ' ' + (new Date().toString())) + ".png"
                //******Below file_path is hardcoded to match porygon for now
            node.file_path = '/home/ubuntu/images/' + filename;
            var local_path = osHomedir() + '/temp/' + mode + '/' + filename;
            node.source = 'ebay';
            node.type = list
            node.imgSrc = image
            var categoryString = item.category
            categoryString = categoryString.replace(/Clothing, Shoes & Accessories|Wholesale|Clothing/g, '')
            var firstIteration = item.name.concat(' ' + categoryString);
            firstIteration = _.uniq(firstIteration.split(' '), function(word) {
                return word.toLowerCase().trim()
            }).join(' ').replace(/'/g, '').replace(/[^\w\s]|:/gi, ' ').replace(/\u00a0/g, " ");
            // console.log('Caption: ', firstIteration)
            node.captions = [firstIteration]

            saveNode(node).then(function(saved) {
                if (saved) {
                    saveImage(node.imgSrc, local_path).then(function() {
                        wait(finishedNode,200)
                    })
                } else {
                    finishedNode()
                }
            })
        }, function finishedNodes(err) {
            resolve()
        })

    })
}


function saveNode(node) {
    return new Promise(function(resolve, reject) {
        db.FeedData.findOne({
            'imgSrc': node.imgSrc
        }, function(err, res) {
            if (err) {
                console.log(err)
            }
            if (!res) {
                var datum = new db.FeedData(node)
                datum.save(function(err, res) {
                    if (err) {
                        console.log(err)
                    }
                    // console.log('Saved node.', res)
                    resolve(1)
                })
            } else if (res) {
                console.log('Image already exists in db.', node.imgSrc)
                resolve(0)
            }
        })
    })
}

function saveImage(url, path) {
    return new Promise(function(resolve, reject) {
        request({
            url: url,
            encoding: 'binary'
        }, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                var base64 = body
                fs.writeFile(path, base64, 'binary', function(err) {
                    if (err) console.log('\n\n!!!PLEASE MAKE SURE THERE IS A TEMP FOLDER IN HOME DIR WITH SUBFOLDERS: TEST AND TRAIN!!!\n', err);
                    // im.resize({
                    //     srcPath: path,
                    //     dstPath: path,
                    //     strip: true,
                    //     quality: 85,
                    //     width: 400
                    // }, function(err, stdout, stderr) {
                    //     if (err) console.log('\n\n!!!PLEASE MAKE SURE THERE IS A TEMP FOLDER IN HOME DIR WITH SUBFOLDERS: TEST AND TRAIN!!!\n\n', err);
                    console.log('Image saved.')
                    resolve()
                        // })
                })
            } else {
                if (err) {
                    console.log(err)
                }
                console.log('body: ', body)
                reject('Cannot download image.')
            }
        });
    })
}


function getCaptions(item) {
    return new Promise(function(resolve, reject) {
        var categoryString = item.category
        if (categoryString.indexOf('Clothing, Shoes & Accessories:') > -1) {
            categoryString = categoryString.replace('Clothing, Shoes & Accessories:', '')
            if (categoryString.indexOf(':') > -1) {
                categoryString = categoryString.replace(/:/g, ' ')
            }
        }
        console.log('categoryString: ', categoryString)
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
                    absolutes.push(color)
                    break;
                case 'Season':
                    season = {
                        Name: 'Season',
                        Value: detail.Value[0]
                    }
                    absolutes.push(season)
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
        var firstIteration = item.name.concat(' ' + categoryString);
        firstIteration = _.uniq(firstIteration.split(' '), function(word) {
            return word.toLowerCase().trim()
        }).join(' ');

        console.log('First Iteration: ', firstIteration)
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
            console.log('\nSituation: Details exist for item.\n')
            var exchangables = []
            async.eachSeries(variables, function iterator(variable, finishedVariable) {
                    var word = variable.Value
                    var cat = variable.Name ? variable.Name.toLowerCase().trim() : 'general'
                    if (word.split(' ').length > 1) {
                        // if (variable.Name == 'Material') {
                        //     console.log('127')
                        //     word = word.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '');
                        // } else {
                        console.log('Input is longer than one word, skipping: ', word)
                        return finishedVariable()
                            // }
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
                        if (bool == 'true' && STOP_STRING.indexOf(word.toLowerCase().trim())) {
                            console.log('Finding synonyms for: ', word)
                            getSynonyms(word, cat).then(function(res2) {
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
                            if (token && STOP_STRING.indexOf(token.toLowerCase().trim()) > -1) {
                                // console.log('This token is untouchable: ', token)
                                return finishedToken()
                            }
                            if (absolutes.map(function(o) {
                                    return o.Value
                                }).join(' ').indexOf(token.trim()) > -1) {
                                return finishedToken()
                            }

                            checkWord(token).then(function(res) {
                                try {
                                    var bool = res.isWord
                                } catch (err) {
                                    if (err) console.log('\n\n\nYou must run synonym.py!\n\n\n')
                                }

                                if (bool == 'true') {
                                    getSynonyms(token, 'general').then(function(results) {
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
            console.log('\nSituation: No details for item.\n')
            if (tokens && tokens.length > 0) {
                async.eachSeries(tokens, function iterator(token, finishedToken) {
                        token = token.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '')
                        if (token && STOP_STRING.indexOf(token.toLowerCase().trim()) > -1) {
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
                                getSynonyms(token, 'general').then(function(results) {
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
                        var captions = [firstIteration, secondIteration]
                        return resolve(captions)
                    })
            }
        }
    })
}

function getSynonyms(word, category) {
    return new Promise(function(resolve, reject) {
        var data = {
            word: word,
            category: category
        }
        var options = {
            url: 'http://localhost:5000/syn',
            json: true,
            body: data
        }

        request.post(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                body.synonyms = _.flatten(body.synonyms)
                body.synonyms = _.uniq(body.synonyms)
                body.synonyms.splice(0, 1)
                body.synonyms = body.synonyms.filter(function(word) {
                    return (word.toLowerCase().trim().indexOf(body.original.toLowerCase().trim()) == -1 && word.indexOf('ish') == -1)
                })
                body.synonyms = body.synonyms.map(function(word) {
                    return (word.charAt(0).toUpperCase() + word.slice(1)).replace(/_/g, '');
                })

                // async.eachSeries(body.synonyms, function iterator(word, cb) {
                //     compareWords(body.original, word).then(function() {
                //         wait(cb, 1000)
                //     })
                // }, function done() {
                // })
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
            url: 'http://localhost:5000/score',
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
                    return set.score > 0.1
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
                // console.log('\nTarget: ', word1, '\n', body)
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