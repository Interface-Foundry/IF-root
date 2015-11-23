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

    item.images.forEach(function(img) {
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
        if (absolutes.length > 0) {
            // console.log('\n\n\nVAR')
            var tokens = secondIteration.split(' ');
            console.log('Tokens: ',tokens)
            var synResults = []
            tokens.forEach(function(token) {
                async.eachSeries(absolutes, function iterator(variable, cb) {
                    console.log('Looking up: ',variable.Value[0])
                    var options = {
                        url: 'http://localhost:5000/syn',
                        body: variable.Value[0]
                    }

                    request.post(options, function(err, res, body) {
                        if (!err && res.statusCode == 200) {
                            console.log('Result: ',body)
                            synResults.push(body)

                            // console.log('Result: ',synonyms)

                            wait(cb, 5000)

                            // resolve(body)
                        } else {
                            if (err) {
                                console.log('133', err)
                            }

                            wait(cb, 5000)
                                // console.log('err body: ', JSON.stringify(body))
                                // reject('Error requesting synonyms.')
                        }
                    });

                }, function done() {
                    console.log('done line 159')
                    console.log('Final: ',synResults)
                })

            })
        }
    })
})

mongoStream.on('end', function() {
    console.log('\n\nStream ended.\n\n')


    // wordnet.lookup('bag', function(results) {
    //     console.log('\n\nGOT HERE! ')
    //     results.forEach(function(result) {
    //         console.log('------------------------------------');
    //         // console.log(result.synsetOffset);
    //         // console.log(result.pos);
    //         // console.log(result.lemma);
    //         console.log(result.synonyms);
    //         // console.log(result.gloss);
    //     });
    // });

})

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