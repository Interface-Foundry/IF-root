var db = require('db');
var async = require('async')

db.Landmarks.find({
    $and: [{
        'source_generic_store': {
            $exists: true
        },
        {
            'loc.type': 'MultiPoint'
        },
        {
            $or: [{
                'linkbackname': 'nordstrom.com'
            }, {
                'linkbackname': 'zara.com'
            }]
        }
    }]
}, function(err, stores) {
    if (err) console.log(err)
        // console.log('Found ', landmarks.length)
    async.eachSeries(stores, function iterator(p, callback) {
            p.loc.type = 'Point';
            p.loc.coordinates = p.loc.coordinates[0];
            p.save(function(err, saved) {
                if (err) console.log(err)
                console.log('Updated: ', saved.id, ' loc: ', saved.loc.coordinates)
                callback()
            })
        },
        function(err) {
            if (err) console.log(err)
            console.log('Finished!')
        })
})