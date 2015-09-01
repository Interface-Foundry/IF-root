var db = require('db');
var async = require('async')

db.Landmarks.find({
    'source_generic_item.StreetAddress': {
        $exists: true
    }
}, function(err, items) {
    if (err) console.log(err)
    console.log('Found ', items.length)
    async.each(items, function iterator(i, callback) {
            if (!i.linkback && !i.linkbackname) {
                loadFakeUser().then(function(o) {
                    i.linkback = item.source_generic_item.src;
                    i.linkbackname = 'nordstrom.com';
                    i.owner = {};
                    i.owner.profileID = o.profileID
                    i.owner.name = o.name;
                    i.owner.mongoId = o._id
                    i.save(function(err, si) {
                        if (err) console.log(err)
                            console.log('fixed!', i.id, i.linkback)
                        return callback()
                    })
                }).catch(function(err) {

                })
            } else {
                callback()
            }


        },
        function(err) {
            if (err) console.log(err)

            console.log('Finished!')
        })

})


function loadFakeUser() {
    return new Promise(function(resolve, reject) {
        db.Users
            .findOne({
                'profileID': 'nordstrom4201'
            }).exec(function(e, o) {
                if (o) {
                    resolve(o)
                }
                if (!o) {
                    var fake = new db.User()
                    fake.name = 'Nordstrom'
                    fake.profileID = 'nordstrom4201'
                    fake.save(function(err, o) {
                        if (err) {
                            console.log(err)
                        } else {
                            resolve(o)
                        }
                    })
                }
                if (e) {
                    console.log(e)
                    reject(e)
                }
            })
    })
}