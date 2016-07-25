var db = require('db');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var TestLocations = require('../../test/TestLocations');
var neighborhood = TestLocations.UnionSquareNYC;

// Use the same authentication as regular kip
//app.use('/', require('../../components/IF_auth/new_auth'));

// Use cookie session ids
app.use(cookieParser());
app.use(bodyParser.json());

app.set('view engine', 'jade');
app.set('views', '.');

// get a page bitches
app.get('/', function(req, res, next) {
    if (!req.cookies.kiptagsid) {
        res.cookie('kiptagsid', uuid.v4());
    }

    // send a random page
    getItem(function(item) {
        res.render('item', {item: item.toObject(), user: req.user});
    });
});

app.post('/kiptag', function(req, res, next) {
    db.Landmarks
        .findById(req.body.id)
        .exec(function(e, l) {
            if (e) { return next(e) }
            l.flags.humanProcessed = true;
            l.flags.humanProcessedTime = new Date();
            l.meta.humanTags = req.body;
            if (req.cookies.kiptagsid)
                l.meta.humanTags.taggedBy = req.cookies.kiptagsid;
            delete l.meta.humanTags.id;
            l.save(function(e) {
                if (e) { return next(e) }
                res.send('y.y');
            })
        })
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
        'itemImageURL.2': {$exists: true},
        loc: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [neighborhood.loc.lon, neighborhood.loc.lat]
                }
            }
        }
    }).exec(function(e, i) {
        if (e) { console.error(e) }
        i.flags.humanProcessedTime = new Date();
        i.save();
        cb(i);
    })
}