var areas = require('./areas.js')
var async = require('async')
var db = require('../../components/IF_schemas/db');


//Add new fields area and density to matching documents in areas file
async.eachSeries(areas.data, function(el, callback) {
    var query = {
        zipcode: el.GEOID
    };
    db.Zipcode.findOne(query,
        function(err, elem) {
            if (err) {
                console.log('mongo error: ', err)
                callback(err)
            } else if (!elem) {
                console.log('Could not find zipcode', query)
                callback()
            } else {
                console.log('Updating ', elem.zipcode)
                db.Zipcode.update({
                        _id: elem._id
                    }, {
                        $set: {
                            area: el.ALAND_SQMI,
                            density: el.ALAND_SQMI / elem.pop
                        }
                    },
                    function(err, data) {
                        if (err) callback(err)

                        console.log('Updated!', data)
                        callback(null)
                    });
            }
        });
}, function done(err) {
    if (err) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('A file failed to process');
    } else {
        console.log('All files have been processed successfully');
    }
});

