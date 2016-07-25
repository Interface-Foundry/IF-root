var Promise = require('bluebird');
var db = require('db');
var memoize = require('./memoize');

module.exports = memoize(function(row) {
    return new Promise(function(resolve, reject) {
        //make sure there's a user who is the owner in the database
        db.Users.findOne({
            profileID: row.StoreId
        }).exec(function(e, u) {
            if (e) {
                console.error(e);
                reject(e);
            }
            if (u) {
                var owner = u.getSimpleUser();
                delete owner.avatar;
                resolve(owner);
            } else {
                var owner = new db.User({
                    name: row.StoreName,
                    addr: row.StoreAddress,
                    profileID: row.StoreId
                });
                owner.save(function(e, o) {
                    if (e) {
                        console.error(e);
                        return reject(e);
                    }
                    var owner = o.getSimpleUser();
                    delete owner.avatar;
                    resolve(owner);
                })
            }
        })
    });
});