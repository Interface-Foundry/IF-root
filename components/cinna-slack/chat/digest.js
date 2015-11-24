// synonyms
// material - absolute
// color - variable
// brand - absolute
// size - variable - m --> medium  (filter out longer than x chars)
// season - variable
// 
// 
// 
var natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    wordnet = new natural.WordNet(__dirname + '/dict'),
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
    fs = require('fs');

var mongoStream = db.EbayItems
    .find({})
    .sort({
        '_id': -1
    })
    .limit(5)
    .stream();

var data = {
    images: []
}

mongoStream.on('data', function(item) {
    // console.log('item.name: ', item.images.length);

    async.eachSeries(item.images, function iterator(img, finishedImage) {
        console.log('Starting Image...')
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
                        Value: detail.Value
                    }
                    absolutes.push(brand)
                    break;
                case 'Material':
                    material = {
                        Name: 'Material',
                        Value: detail.Value
                    }
                    absolutes.push(material)
                    break;
                case 'Gender':
                    gender = {
                        Name: 'Gender',
                        Value: detail.Value
                    }
                    absolutes.push(gender)
                    break;
                case 'Size':
                    size = {
                        Name: 'Size',
                        Value: detail.Value
                    }
                    absolutes.push(size)
                    break;
                case 'Color':
                    color = {
                        Name: 'Color',
                        Value: detail.Value
                    }
                    variables.push(color)
                    break;
                case 'Season':
                    season = {
                        Name: 'Season',
                        Value: detail.Value
                    }
                    variables.push(season)
                    break;
                case 'Style':
                    style = {
                        Name: 'Style',
                        Value: detail.Value
                    }
                    variables.push(style)
                    break;
            }
        })

        // console.log('*****', variables, absolutes)
        var firstIteration = item.name;
        details.forEach(function(detail) {
            if (detail) {
                firstIteration.concat(' ' + detail.Value)
            }
        })
        console.log('\nfirst: ', firstIteration, '\n')
        var secondIteration = firstIteration;
        if (variables.length > 0) {
            var tokens = secondIteration.split(' ');
            // console.log('Tokens: ', tokens)
            console.log('Variables: ', variables)
            var candidates = []
            async.eachSeries(tokens, function iterator(token, finishedToken) {

                    async.eachSeries(variables, function iterator(variable, finishedVariable) {
                            var word = variable.Value[0]

                            if (word.split(' ').length > 1) {
                                console.log('Input is longer than one word, skipping: ', word)
                                return finishedVariable()
                            }
                            if (word.length <= 2) {
                                console.log('Not a word skipping', word)
                                return finishedVariable()
                            }
                            // word = word.replace(/'s/g, ''); //get rid of 's stuff (apostrophes and plurals, like "women's" or "men's". this removes the 's)
                            word = word.replace(/[^\w\s]/gi, ''); //remove all special characters
                            // tags = tags.replace(/\s+/g, ' ').trim(); //remove extra spaces from removing chars
                            console.log('Looking up: ', word)

                            checkWord(word).then(function(res1) {
                                var bool = JSON.parse(res1).isWord
                                console.log('Is it a word? :', bool)
                                if (bool == 'true') {
                                    getSynonyms(word).then(function(res2) {
                                        var results = JSON.parse(res2)
                                        console.log('Syns: ', results)

                                        var i = results.synonyms.length
                                        while (i--) {
                                            if (results.synonyms[i].toLowerCase().trim() == variable.Name.toLowerCase().trim()) {
                                                results.synonyms.splice[i,1]
                                            }
                                        }

                                      
                                        if (results.synonyms && results.synonyms.length > 0 && candidates) {
                                            candidates.push(results)
                                        } else {
                                            console.log('No synonyms found.')
                                        }
                                        finishedVariable()
                                    })
                                } else {
                                    console.log('Not a word!')
                                    finishedVariable()
                                }
                            })
                        },
                        function finishedVariables() {
                            // console.log('done line 159')
                            // console.log('Final: ', synResults)
                            finishedToken()
                        })
                },
                function finishedTokens(err) {
                    if (err) console.log('167: ', err)
                    candidates = _.uniq(candidates, 'original')
                    console.log('Final: ', candidates)
                })
        }

    }, function finishedImages(err) {

    })

})

mongoStream.on('end', function() {
    // console.log('\n\nStream ended.\n\n')


})

function checkWord(word) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'http://localhost:5000/check',
            body: word
        }
        request.post(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
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

function getSynonyms(word) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'http://localhost:5000/syn',
            body: word
        }
        request.post(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
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


function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}