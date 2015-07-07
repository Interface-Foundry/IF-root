// parses a tsv downloaded from
// https://docs.google.com/spreadsheets/d/1FzeyMOX5eVdFXD4IDekbwl3DTKrA5o8Bir8yMaUhPXw/edit#gid=0

var fs = require('fs');
var _ = require('lodash');
var Promise = require('bluebird');
global.config = require('config');
var db = require('db');
var getAddressInfo = require('./getAddressInfo');
var sheetText = fs.readFileSync('./NYC Retail Scrape - Sheet1.tsv').toString();
//console.log(sheetText);

var rows = sheetText.split('\n');
rows.splice(0,1); // removes header row

var stores = rows.map(function(r) {
    var s = {};
    var fields = r.split('\t');
    s.name = fields[0];
    s.address = fields[1];
    s.instagram = fields[2];
    s.pinterest = fields[3];
    s.web1 = fields[4];
    s.web2 = fields[5];
    s.etsy = fields[6];

    return s;
});


// Process instagram stores
var instagram = require('instagram-node').instagram();
instagram.use({
    access_token: '519da9c304a147ddb12e0b58bf2a0598'
});
instagram.use({
    client_id: '9069a9b469824abea0d0cce7acb51fa8',
    client_secret: 'cb7a9f7cdb67498bbf0641b6d7489604'
});


var instagrams = stores.filter(function(s) {
    return !!s.instagram;
});

setTimeout(function() {
    Promise.all(instagrams.map(function (i) {
        // could be "username" or "https://instagram.com/username" or even have a trailing slash
        var instagramId = i.instagram.replace(/.*instagram.com\//, '').replace(/\/.*$/, '');

        // check to see if we have this in the db already
        return db.Landmarks.findOne({
            'source_instagram_user.username': instagramId
        }).exec().then(function (landmark) {
            debugger;
            if (landmark) {
                console.log('already have entry for instagram account', instagramId);
                return landmark;
            }

            // otherwise make a new one.
            return new Promise(function (resolve, reject) {
                instagram.user_search(instagramId, function (err, res) {
                    if (err) {
                        return reject(err);
                    }

                    if (!res || !res[0] || !res[0].id) {
                        return reject('no user found for username: ' + instagramId);
                    }

                    instagram.user(res[0].id, function (err, res2) {
                        if (err) {
                            return reject(err);
                        }

                        if (!res2 || !res2.id) {
                            return reject('no user found for username ' + instagramId + ', id: ' + res[0].id);
                        }

                        getAddressInfo(i.address).then(function (addr) {
                            debugger;
                            var l = new db.Landmark({
                                source_instagram_user: res2,
                                addressString: i.address,
                                name: i.name,
                                id: i.name.replace(/[^\w\d]/g, '').toLowerCase() + '_' + res2.id,
                                world: true,
                                valid: true,
                                loc: {
                                    type: 'Point',
                                    coordinates: [addr.geometry.location.lng, addr.geometry.location.lat]
                                }
                            });
                            return l.save();
                        }).then(function (l) {
                            console.log('created new landmark for instagram user', instagramId);
                            console.log(l);
                            resolve(l);
                        }).catch(reject);
                    });
                });
            });
        });
    })).catch(function (err) {
        console.error(err);
    });
}, 1000);


