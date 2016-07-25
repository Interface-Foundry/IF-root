var request = require('request');
var cheerio = require('cheerio');
var db = require('db');
var kip = require('kip');
var _ = require('lodash');

var startingUrl = 'http://www.dsw.com/locations/US';
var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Host': 'www.dsw.com',
    'Origin': 'http://www.dsw.com',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.8'
};

/**
 * dsw user
 */
var dsw;

function getDSWUser() {
    db.Users.findOne({
        profileID: 'dsw'
    }, function(e, u) {
        if (kip.err(e)) return;
        if (!u) {
            console.log('creating new dsw user');
            dsw = new db.User({
                name: 'DSW',
                profileID: 'dsw',
                description: 'DSW: Designer Show Warehouse',
                location: 'US'
            })
            dsw.save(function(e) {
                if (kip.err(e)) return;
                dsw = {
                    profileID: dsw.profileID,
                    mongoId: dsw._id.toString(),
                    name: dsw.name
                };
                scrape();
            })
        } else {
            dsw = {
                mongoId: u._id.toString(),
                profileID: u.profileID,
                name: u.name
            };
            console.log('using dsw user', dsw);
            scrape();
        }
    })
}
getDSWUser();

function scrape() {
    request({
        url: startingUrl,
        headers: headers
    }, function (e, r, b) {
        var $ = cheerio.load(b);
        var urls = $('.searchBlock a').map(function () {
            return 'http://www.dsw.com' + $(this).attr('href');
        }).toArray();

        function next() {
            scrapeStatePage(urls.pop(), function () {
                process.nextTick(function() {
                    next();
                })
            })
        }

        next();
    })
}

/**
 * The DSW store directory is organized by state.
 * @param url
 * @param done
 */
function scrapeStatePage(url, done) {
    if (!url) {
        console.log('done');
        process.exit(0);
    }
    request({
        url: url,
        headers: headers
    }, function(e, r, b) {
        console.log('got', url);
        if (!b) {
            console.log('no b');
            return done();
        }
        var $ = cheerio.load(b);
        $('.result').map(function() {
            var store = {};
            var $this = $(this);
            store.source = 'dsw';
            store.mapLink = $this.find('.links a').attr('href');
            if (!store.mapLink) {
                // some states do not have dsw
                return;
            }
            store.fullDescription = $this.find('address').text().trim() || '';
            var parts = store.fullDescription.split('\n');
            store.name = 'DSW - ' + parts[0];
            store.address = parts[1] + ' ' + parts[2];
            store.phone = parts[3];
            store.hours = parts[4];
            store.lon = store.mapLink.match(/&long=(.*)/)[1];
            store.lat = store.mapLink.match(/&lat=(.*)&/)[1];
            store.id = $this.find('input[name="storeID"]').val();
            store.lastUpdated = new Date();

            var kipId = 'dsw_' + store.id;
            db.Landmarks.findOne({
                id: kipId
            }, function(e, l) {
                if (kip.err(e)) { return }
                l = l || new db.Landmark({});
                var scrapedStuff = {
                    name: store.name,
                    id: kipId,
                    world: true,
                    owner: dsw,
                    loc: {
                        type: 'Point',
                        coordinates: [parseFloat(store.lon), parseFloat(store.lat)]
                    },
                    addressString: store.address,
                    tel: store.phone,
                    description: store.fullDescription,
                    source_generic_store: store
                };
                _.merge(l, scrapedStuff);
                l.markModified('source_generic_store');
                l.save(function(e) {
                    kip.err(e);
                })
            });

        })
        done();
    })
}