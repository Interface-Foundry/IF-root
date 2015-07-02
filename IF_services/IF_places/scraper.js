var http = require("http");
var cheerio = require("cheerio");
var pageIndex = '';
var pageCount = 1;
var response_text = "";
var fs = require('fs')
var zipCheck = [];
var q = require('q');
var async = require('async');

var options = {
    host: "zipatlas.com",
    path: ''
};
var fin = false;
var currentStateIndex = 0;
var col = 1
    //Navigate from home page to individual state page for each state
async.whilst(
    function() {
        return !fin
    },
    function(callback) {
        // console.log('Going to state: ', options, currentStateIndex,col)
        gotoState(options, currentStateIndex, col).then(function(path) {
            // options.path = path;
            currentStateIndex++;
            callback(null);
        }).catch(function(err) {
            console.log('hitting catch', err)
            done = true;
            callback(err)
        })
    },
    function(err) {
        console.log(err)
        console.log('Finished!')
    })

function gotoState(options, index, col) {
    if (index == 25) {
        console.log('Next column!')
        col = 2
        index = 0
    }

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
                        deferred.resolve(firstCol[index].attribs.href);
                        currentStateIndex++
                    }
                } else if (col == 2) {
                    if (index == 24) {

                    } else {
                        if (secondCol[index].name == 'a') {
                            console.log(secondCol[index].attribs.href)
                            deferred.resolve(secondCol[index].attribs.href);
                            currentStateIndex++
                        } else {

                        }
                    }
                }
            }
        })
    })
    request.end();
    return deferred.promise
}

function gotoDensity(options) {
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
                var link = $(":contains('Population Density in')").attribs.href
                console.log(link)
            }
        })
    })
}



// var options2 = {
//     host: "zipatlas.com",
//     path: "/us/ny/zip-code-comparison/population-density.htm"
// };

// var done = false;
// //Recursively call connect() until it reaches the final page
// async.whilst(
//     function() {
//         return !done
//     },
//     function(callback) {
//         collect(options2).then(function() {
//             pageCount++;
//             pageIndex = '.' + pageCount.toString();
//             options2.path = '/us/ny/zip-code-comparison/population-density' + pageIndex + '.htm';
//             console.log('new options: ', options)
//             callback(null, options);
//         }).catch(function(err) {
//             console.log('hitting catch', err)
//             done = true;
//             callback(err)
//         })
//     },
//     function(err) {
//         console.log('Finished!')
//     })



function collect(options) {
    var deferred = q.defer();
    var request = http.request(options, function(resp) {
        console.log('Page: ', pageIndex)
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
                var text = $(":contains('Zip Code')").parent().parent().find("tr").each(function(tr_index, tr) {
                    var th_text = $(this).find(".report_header").text();
                    var prop_name = th_text.trim().toLowerCase().replace(/[^a-z]/g, "");
                    var zipcode = $(this).find("td .report_data").eq(1).text();
                    var density = $(this).find("td .report_data").eq(5).text();
                    if (zipcode !== '') {
                        if (zipCheck.join('').indexOf(zipcode.toString()) == -1) {
                            zipCheck.push(zipcode);
                            var json = {
                                zipcode: zipcode,
                                density: density
                            }
                            var string = JSON.stringify(json)
                            fs.appendFile('density.json', string + ',\n', function(err) {
                                if (err) throw err;
                                console.log(string)
                            });
                        }
                    }
                });
                deferred.resolve();
            }
        });
    });
    request.end();
    return deferred.promise;
}