var db = require('db');
var async = require('async');
var tagParser = require('../tagParser');

db.Landmarks.find({
    'source_generic_item': {
        $exists: true
    },
    'linkbackname': 'zara.com'
}, function(err, items) {
    if (err) console.log(err)
    console.log('Found ', items.length)
    async.eachSeries(items, function iterator(i, callback) {
            if (i.itemTags.text.length > 0) {
                console.log('.')
                i.itemTags.text = tagParser.parse(i.itemTags.text)
            }

            i.save(function(err, saved) {
                if (err) console.log(err)
                    console.log('fixed!', saved.itemTags.text)
                callback()
            })
        },
        function(err) {
            if (err) console.log(err)

            console.log('Finished!')
        })

})