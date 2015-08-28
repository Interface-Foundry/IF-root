var tsv = require('tsv');
var Promise = require('bluebird');
var request = require('request');
var colors = require('colors');

var sheet = 'https://docs.google.com/spreadsheets/d/1FzeyMOX5eVdFXD4IDekbwl3DTKrA5o8Bir8yMaUhPXw/export?gid=1940344462&format=tsv';
var testing = false;

/**
 * Downloads the retail scrape speadsheet and returns an array of the valid rows
 * @returns {bluebird|exports|module.exports}
 */
var getRows = function() {
    return new Promise(function(resolve, reject) {
        request.get(sheet, function(e, r, b) {
            if (e) {
                console.error(e);
                return reject(e);
            }

            var a = (new tsv.Parser('\t')).parse(b);

            // filter to just the valid rows
            var rows = a.reduce(function(rows, row) {
                var ok = (function() {
                    if (!row.StoreName) return;
                    if (!row.StoreAddress) return;
                    row.StoreLon = parseFloat(row.StoreLon);
                    if (isNaN(row.StoreLon)) return;
                    row.StoreLat = parseFloat(row.StoreLat);
                    if (isNaN(row.StoreLat)) return;
                    if (!row.StoreId) return;
                    if (!row.LinkbackName) return;
                    if (!row.StoreURL) return;
                    if (!row.URLSelector) return;

                    // the only things we really need for the item is the name and images
                    if (!row.ItemName) return;
                    if (!row.ItemImages) return;
                    return true;
                })();

                if (!ok) {
                    // there's this weird thing where there are a bunch of extra simple rows. we'll ignore them
                    if (JSON.stringify(row) === '{"StoreName":""}') {
                        return rows;
                    }
                    if (testing) {
                        console.error('row failed validation:'.red);
                        console.error(JSON.stringify(row, null, 2).red);
                    }
                } else {
                    rows.push(row);
                    if (testing) {
                        console.log(JSON.stringify(row).green);
                    }
                }
                return rows;
            }, []);
            resolve(rows);
        });
    });
};

if (!module.parent) {
    testing = true;
    console.log('running in test mode');
    getRows().then(function() { console.log('test complete')});
}

module.exports = getRows;