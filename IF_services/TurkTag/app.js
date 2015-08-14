var db = require('db');
var express = require('express');
var app = express();
var job = require('job');

// Use the same authentication as regular kip
app.use('/', require('../../components/IF_auth/new_auth'));

app.set('view engine', 'jade');
app.set('views', '.');

// get a page bitches
app.get('/', function(req, res, next) {
    if (!req.user) {
        // send login wall
        res.render('login');
    } else {
        // send a random page
        getItem(function(item) {
            res.render('item', {item: item.toObject(), user: req.user});
        });
    }
});

app.post('/kiptag', function(req, res, next) {
    if (!req.user) {
        next('Must be logged in');
    } else {
        db.Landmarks
            .findById(req.body.id)
            .exec(function(e, l) {
                if (e) { return next(e) }
                l.flags.humanProcessed = true;
                l.flags.humanProcessedTime = new Date();
                l.meta.humanTags = req.body;
                delete l.meta.humanTags.id;
                l.save(function(e) {
                    if (e) { return next(e) }
                    res.send('y.y');
                })
            })
    }
});

app.use(express.static('static'));

app.listen(8081, function() {
    console.log('app listening on port 8081');
})

/**
 * Gets an item that needs to be tagged from the process queue
 */
function getItem(cb) {
    db.Landmarks.findOne({
        world: false,
        'flags.humanProcessed': {$ne: true},
        'flags.humanProcessedTime': {$exists: false},
        'itemImageURL.2': {$exists: true}
        //'source_shoptiques_item.url': {$exists: true}
    }).exec(function(e, i) {
        debugger;
        if (e) { console.error(e) }
        i.flags.humanProcessedTime = new Date();
        i.save();
        cb(i);
    })
}