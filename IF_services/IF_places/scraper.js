var http = require("http");
var cheerio = require("cheerio");
var pageIndex = '';
var pageCount = 1;
var response_text = "";
var fs = require('fs')
var zipCheck = [];


function connect(options, callback) {
    if (options == null) {
        var options = {
            host: "zipatlas.com",
            path: "/us/ny/zip-code-comparison/population-density.htm"
        };
    }
    var request = http.request(options, function(resp) {
        console.log('Page: ', pageIndex)
        if (resp.statusCode != 200) {
            setInterval(function() {
                console.log('Reached end of pages...')
                return;
            }, 3000)
        };
        resp.setEncoding("utf8");
        resp.on("data", function(chunk) {
            response_text += chunk;
        });
        resp.on("end", function() {
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
                        });
                    }
                }
            });
            pageCount++
            pageIndex = '.' + pageCount.toString();
            options.path = '/us/ny/zip-code-comparison/population-density' + pageIndex + '.htm';
            callback(null, options);
        });
    });
    request.on("error", function(e) {
        throw "Error: " + e.message;
    });
    request.end();
    request.on('error', function(error) {
        console.log('request error', error);
        callback({
            error: error
        });
    });
}

var cb = function(err, opt) {
    if (err) {
        console.log('something went wrong:', err);
    } else {
        console.log('request done');
        connect(opt, cb)
    }
}

connect(null, cb);