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
            },
            {
                'linkbackname': 'urbanoutfitters.com'
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


//mongo command to update stores with 'MultiPoint'
// db.landmarks.find({$and: [{'source_generic_store': {$exists: true}}, {'loc.type': 'MultiPoint'}, {linkbackname: {$in: ['nordstrom.com', 'zara.com', 'urbanoutfitters.com']}}]}).forEach(function(s) {s.loc.type = 'Point';s.loc.coordinates = s.loc.coordinates[0];print('Updated store: ',s);db.landmarks.save(s);})