var db = require('db');
var async = require('async')

db.Landmarks.find({
    'source_generic_store.storeSections': {
        $exists: true
    }
}, function(err, items) {
    if (err) console.log(err)
    console.log('Found ', items.length)
    async.each(items, function iterator(i, callback) {
            if (i.name.indexOf('Zara') > -1 && !i.linkback && !i.linkbackname) {
                i.linkback = 'http://www.zara.com'
                i.linkbackname = 'zara.com'
            }

            i.save(function(err, si) {
                if (err) console.log(err)
                // console.log('fixed!', is.linkback)
                callback()
            })
        },
        function(err) {
            if (err) console.log(err)

              console.log('Finished!')
        })

})