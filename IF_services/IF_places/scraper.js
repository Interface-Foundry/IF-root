var http = require("http");
var request = require("request");
var cheerio = require("cheerio");
var response_text = "";
var fs = require('graceful-fs')
var q = require('q');
var async = require('async');
var hash = require('./hash.js')

var fin = false;
var currentStateIndex = 0;
var col = 1

async.whilst(
    function() {
        return !fin
    },
    function(cb) {
        var options = {
            host: "zipatlas.com",
            path: ''
        };
        console.log('Starting...', currentStateIndex)
            //Navigate from home page to to zipcode population density page
        async.waterfall([
                function(callback) {
                    gotoStatePage(options, currentStateIndex, col)
                        .then(function(path) {
                            var deferred = q.defer()
                            options.path = path;
                            var stateName = options.path.split('/us/')[1].split('.')[0].trim()
                            var state = capitalizeFirstLetter(stateName)
                            for (var key in hash) {
                                if (hash.hasOwnProperty(key)) {
                                    if (hash[key] === state) {
                                        var shortName = key.toLowerCase().trim()
                                        break
                                    }
                                }
                            }
                            currentStateIndex++;
                            if (col == 1 && currentStateIndex == 52) {
                                console.log('Next column!')
                                col = 2
                                currentStateIndex = 0
                            } else if (col == 2 && currentStateIndex == 50) {
                                console.log('Finished!!')
                                fin = true;
                            }
                            options.path = '/us/' + shortName + '/zip-code-comparison/population-density.htm'
                            callback(null, shortName, options)
                        })
                },
                function(shortName, options, callback) {
                    var done = false;
                    var pageIndex = '';
                    var pageCount = 1;
                    //Recursively call collectData() until it reaches the final page results
                    async.whilst(
                            function() {
                                return !done
                            },
                            function(callback) {
                                setTimeout(function() {
                                    collectData(options, shortName).then(function() {
                                        pageCount++;
                                        pageIndex = '.' + pageCount.toString();
                                        options.path = '/us/' + shortName + '/zip-code-comparison/population-density' + pageIndex + '.htm'
                                        console.log('Collecting from: ', options.path)
                                        callback(null);
                                    }).catch(function(err) {
                                        console.log('collectData err: ', err)
                                        done = true;
                                        callback(err)
                                    })
                                }, 1000);
                            },
                            function(err) {
                                console.log('Finished! Going back to homepage..')
                                options = {
                                    host: "zipatlas.com",
                                    path: ''
                                };
                                done = true;
                                cb();
                            }) //END OF ASYNC.WHILST
                }
            ],
            function(err, result) {
                console.log(err)
                console.log('Finished!')
            }); //END OF ASYNC.WATERFALL
    },
    function(err) {
        console.log(err)
        console.log('Finished!')
    })


function collectData(options, shortName) {
    var deferred = q.defer();

    // request(options, function(err, res, body) {
    //     if (err) console.log(err);
    //     var data = JSON.parse(body);
    // })

    var request = http.request(options, function(resp) {
        resp.setEncoding("utf8");

        resp.on("data", function(chunk) {
            response_text += chunk;
        });

        resp.on("end", function() {
            if (resp.statusCode != 200) {
                console.log('status Code: ', resp.statusCode)
                deferred.reject(resp.statusCode)
            } else {
                $ = cheerio.load(response_text);

                var firstIndex = ($("span.link").text().length) - 8
                var lastIndex = ($("span.link").text().length)
                var next = $("span.link").text().substr($("span.link").text().length - 7, $("span.link").text().length)
                console.log('Next page: ', next)
                if (next !== 'Next >>') {
                    console.log('Last Page!')
                    return deferred.reject()
                }

                var text = $(":contains('Zip Code')").parent().parent().find("tr").each(function(tr_index, tr) {
                    var th_text = $(this).find(".report_header").text();
                    var prop_name = th_text.trim().toLowerCase().replace(/[^a-z]/g, "");
                    var zipcode = $(this).find("td .report_data").eq(1).text();
                    var location = $(this).find("td .report_data").eq(2).text();
                    var city = $(this).find("td .report_data").eq(3).text();
                    var population = $(this).find("td .report_data").eq(4).text();
                    var density = $(this).find("td .report_data").eq(5).text();
                    if (zipcode !== '') {
                        var json = {
                            state: shortName,
                            zipcode: zipcode,
                            location: location,
                            city: city,
                            population: population,
                            density: density
                        }
                        var string = JSON.stringify(json)
                        fs.appendFile('data.json', string + ',\n', function(err) {
                            if (err) {
                                console.log('Append file error: ', err)
                                throw err;
                            }
                        });
                    }
                });

                deferred.resolve();
            }
        });
    });

    request.on("error", function(e) {
        throw "Error: " + e.message;
    });

    request.end();
    return deferred.promise;
}

function gotoStatePage(options, index, col) {
    var deferred = q.defer();
    var request = http.request(options, function(resp) {
        resp.setEncoding("utf8");
        resp.on("data", function(chunk) {
            response_text += chunk;
        });
        resp.on("end", function() {
            if (resp.statusCode != 200) {
                console.log('status Code: ', resp.statusCode)
                deferred.reject()
            } else {
                $ = cheerio.load(response_text);
                var firstCol = $(":contains('Alabama')")['14'].children
                var secondCol = $(":contains('Nebraska')")['14'].children
                if (col == 1) {
                    if (firstCol[index].name == 'a') {
                        console.log('Got new link: ', firstCol[index].attribs.href)
                        currentStateIndex++
                        deferred.resolve(firstCol[index].attribs.href);
                    }
                } else if (col == 2) {
                    if (secondCol[index].name == 'a') {
                        console.log('Got new link: ', secondCol[index].attribs.href)
                        deferred.resolve(secondCol[index].attribs.href);
                        currentStateIndex++
                    }
                }
            }
        })
    })
    request.end();
    return deferred.promise
}



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}