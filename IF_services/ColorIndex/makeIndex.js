var db = require('db');
var colorTools = require('./colorTools');

function next() {
    db.Landmarks.findOne({
        'itemImageURL.0': {$exists: true},
        'itemTags.colors.0': {$exists: false}
    }).exec().then(function(l) {
        return colorTools.findColorsForLandmark(l)
            .then(function(c) {
                l.itemTags.colors = c;
                return l.save();
            }, function(e) {
                console.log(e);
            })
    }).then(function(l) {
        console.log('processed', l.name);
        debugger;
        next();
    }, function(e) {
        console.log(e);
    });
}

db.Landmarks.update({
        'itemImageURL.0': {$exists: true}
    }, {$set: {'itemTags.colors': []}})
    .exec()
    .then(function() {
        next();
    });