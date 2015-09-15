var db = require('db');
var async = require('async')

// db.Landmarks.find({
//     $and: [{
//         $or: [{
//                 'source_google.place_id': {
//                     $exists: true
//                 }
//             }, {
//                 'source_generic_store': {
//                     $exists: true
//                 }
//             }
//             // ,{
//             //     'source_generic_item': {
//             //         $exists: true
//             //     }
//             // }
//         ]
//     }, {
//         'loc.type': 'MultiPoint'
//     }]
// }, function(err, landmarks) {
//     if (err) console.log(err)
//         // console.log('Found ', landmarks.length)
//     async.eachSeries(landmarks, function iterator(p, callback) {
//             p.loc.type = 'Point';
//             p.loc.coordinates = p.loc.coordinates[0];
//             p.save(function(err, saved) {
//                 if (err) console.log(err)
//                 console.log('Updated: ', saved.id, ' loc: ', saved.loc.coordinates)
//                 callback()
//             })
//         },
//         function(err) {
//             if (err) console.log(err)
//             console.log('Finished!')
//         })
// })



db.Landmarks.find({
    $and: [{
        'source_generic_item': {
            $exists: true
        }
    }, {
        'loc.type': 'Point'
    }]
}, function(err, landmarks) {
    if (err) console.log(err)
    async.eachSeries(landmarks, function iterator(p, callback) {
            p.loc.type = 'MultiPoint';
            p.loc.coordinates = [p.loc.coordinates];
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