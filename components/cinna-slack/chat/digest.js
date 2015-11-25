// TODO: 
// Get better sample set data.
// Go through tokens and if words are like : Sweater, Outfit, Boy, Baby, Man, Women, syn it.
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
        '_id': 1
    })
    .limit(5)
    .stream();

var data = {
    images: []
}

mongoStream.on('data', function(item) {
    // console.log('item.name: ', item.images.length);
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
                absolutes.push(color)
                break;
            case 'Season':
                season = {
                    Name: 'Season',
                    Value: detail.Value
                }
                absolutes.push(season)
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

    console.log('DETAILS: ', variables, absolutes)
    var firstIteration = item.name;
    absolutes.forEach(function(detail) {
        if (detail) {
            // console.log('Adding detail: ', detail.Name, detail.Value[0])
            firstIteration = firstIteration.concat(' ' + detail.Value[0])
        }
    })
    variables.forEach(function(detail) {
        if (detail) {
            // console.log('Adding detail: ', detail.Name, detail.Value[0])
            firstIteration = firstIteration.concat(' ' + detail.Value[0])
        }
    })
    console.log('\nfirst: ', firstIteration, '\n')
    var secondIteration = firstIteration;
    if (variables.length == 0) {


        var tokens = secondIteration.split(' ');
        // console.log('Tokens: ', tokens)
        // console.log('Variables: ', variables)
        var exchangables = []
        async.eachSeries(variables, function iterator(variable, finishedVariable) {
                var word = variable.Value[0]

                if (word.split(' ').length > 1) {
                    if (variable.Name == 'Material') {
                        word = word.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '');
                    } else {
                        console.log('Input is longer than one word, skipping: ', word)
                        return finishedVariable()
                    }
                }
                console.log('***', word)
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
                        // console.log('Is it a word? :', bool)
                    if (bool == 'true' || variable.Name == 'Color' || variable.Name == 'Season' || variable.Name == 'Style') {
                        getSynonyms(word).then(function(res2) {
                            var results = JSON.parse(res2)
                                // console.log('Syns: ', results)
                            var i = results.synonyms.length
                            while (i--) {
                                // console.log(results.synonyms[i].toLowerCase().trim(),variable.Name.toLowerCase().trim())
                                if (results.synonyms[i].toLowerCase().trim() == variable.Name.toLowerCase().trim()) {
                                    results.synonyms.splice(i, 1)
                                }
                            }
                            if (results.synonyms && results.synonyms.length > 0) {
                                exchangables.push(results)
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
            function finishedVariables(err) {
                if (err) console.log('167: ', err)
                exchangables = _.uniq(exchangables, 'original')
                console.log('Results: ', exchangables)
                    // [ { original: 'Purple',
                    // synonyms: [ 'color', 'mauve', 'plum', 'amaranthine', 'lilac' ] } ]

                var skipWords = exchangables.map(function(obj) {
                        return obj.original.toLowerCase().trim()
                    }).join(' ')
                    // console.log('skipWords ', skipWords)
                async.eachSeries(tokens, function iterator(token, finishedToken) {
                        token = token.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '')
                        if (skipWords.indexOf(token.toLowerCase().trim()) > -1) {
                            // console.log('Token is variable, skipping...')
                        }
                        // console.log('Token: ', token)
                        checkWord(token).then(function(res1) {
                            var bool = JSON.parse(res1).isWord
                                // console.log('Is it a word? :', bool)
                            if (bool == 'true') {
                                getSynonyms(token).then(function(res2) {
                                    var results = JSON.parse(res2);
                                    // console.log('Syns: ', results)
                                    if (results.synonyms && results.synonyms.length > 0) {
                                        exchangables.push(results)
                                    } else {
                                        // console.log('No synonyms found.')
                                    }
                                    finishedToken()
                                })
                            } else {
                                // console.log('Not an exchangable candidate...')
                                finishedToken()
                            }
                        })
                    },
                    function finishedTokens(err) {
                        if (err) console.log('167: ', err)
                        exchangables = _.uniq(exchangables, 'original')
                        console.log('Exchangeables: ', exchangables)
                        exchangables.forEach(function(replacement) {
                            if (secondIteration.indexOf(replacement.original) > -1) {
                                secondIteration = secondIteration.replace(replacement.original, replacement.synonyms[0])
                            }
                        })
                        console.log('First iteration: ', firstIteration)
                        console.log('Second Iteration: ', secondIteration)
                        finishedImage()
                    })
            })

    } else {
        console.log('\n\nNO VARIABLES\n\n')
        async.eachSeries(tokens, function iterator(token, finishedToken) {
                token = token.replace(/[^\w\s]/gi, '').replace(/[0-9]/g, '')
                // console.log('Token: ', token)
                checkWord(token).then(function(res1) {
                    var bool = JSON.parse(res1).isWord
                        // console.log('Is it a word? :', bool)
                    if (bool == 'true') {
                        getSynonyms(token).then(function(res2) {
                            var results = JSON.parse(res2);
                            // console.log('Syns: ', results)
                            if (results.synonyms && results.synonyms.length > 0) {
                                exchangables.push(results)
                            } else {
                                console.log('No synonyms found.')
                            }
                            finishedToken()
                        })
                    } else {
                        // console.log('Not an exchangable candidate...')
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
                console.log('First iteration: ', firstIteration)
                console.log('Second Iteration: ', secondIteration)
                finishedImage()
            })
    }

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