var db = require('db');
var TestLocations = require('../../../test/TestLocations');
var cheerio = require('cheerio');
var request = require('request');

var query = {
    world: false,
    valid: true,
    'source_shoptiques_item.url': {$exists: true},
    loc: {
        $near: {
            type: 'Point',
            coordinates: [TestLocations.UnionSquareNYC.loc.lon, TestLocations.UnionSquareNYC.loc.lat]
        }
    },
    description: {$eq: ''}
};

var next = function() {
    db.Landmarks.findOne(query, function(err, l) {
        if (err) {
            console.error(err);
            return next();
        }

        // if no more landmarks to process, you're done
        if (!l) {
            console.log('done with all');
            process.exit(0);
        }

        console.log('processing', l.source_shoptiques_item.url, l._id);
        getDescription(l.source_shoptiques_item.url, function(e, d) {
            if (e) {
                console.error(err);
                return next();
            }

            if (d) {
                console.log(d);
                l.source_shoptiques_item.description = d;
                l.description = d;
            } else {
                console.log('no description found, marking as invalid');
                l.valid = false;
            }
            l.save(function() {
                setTimeout(function() {
                    next();
                }, 20);
            });
        })
    })
};


next();

function getDescription(url, callback) {
    request(url, function(e, r, b) {
        if (e) return callback(e);
        var $ = cheerio.load(b);
        var d = $('[itemprop="description"]').text().trim();
        if (!d) {

        }
        callback(null, d);
    })
}
