var Promise = require('bluebird');
var db = require('db');
var getRetailUser = require('./getRetailUser');
var memoize = require('./memoize');

var getRetailWorld = function(row) {
    return new Promise(function(resolve, reject) {
        //make sure there's a store who is the parent in the database
        db.Landmarks.findOne({
            id: row.StoreId
        }).exec(function(e, l) {
            if (e) {
                console.error(e);
                reject(e);
            }
            if (l) {
                var parent = l.getSimpleItem();
                delete parent.itemImageURL;
                resolve(parent);
            } else {
                getRetailUser(row).then(function(owner) {
                    var store = new db.Landmark({
                        owner: owner,
                        world: true,
                        id: row.StoreId,
                        loc: {
                            type: 'Point',
                            coordinates: [row.StoreLon, row.StoreLat]
                        },
                        valid: true,
                        addressString: row.StoreAddress,
                        name: row.StoreName

                    });
                    store.save(function(e, s) {
                        if (e) {
                            console.error(e);
                            return reject(e);
                        }

                        var parent = s.getSimpleItem();
                        delete parent.itemImageURL;
                        resolve(parent);
                    })
                    
                })
            }
        })
    })
};

module.exports = memoize(getRetailWorld);