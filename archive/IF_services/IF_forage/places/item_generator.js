var db = require('db');
var randomClothing = require('./randomClothingItem');

/**
 * returns a random element of the array
 * @param thing
 */
var random = function (thing) {
    if (thing instanceof Array) {
        return thing[Math.random() * thing.length | 0];
    } else {
        throw new Error('give me an array or die trying');
    }
};

// [lon, lat] of the starting location
var startingLocation = [-73.990638, 40.7352793];

// search radius for stores to stock the shelves with fake items
var radiusInMeters = 1000;

var users = [];
db.Users.find({profileID: {$in: ['bowser89', 'peach', 'sonic']}}).exec().then(function (u) {
    users = u;
    users.map(function (u) {
        console.log('using using ' + u.profileID);
    });

    return db.Landmarks.find({
        world: true,
        type: 'clothing_store',
        loc: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: startingLocation
                },
                $maxDistance: radiusInMeters,
                $minDistance: 0
            }
        }
    }).exec();
}).then(function (stores) {
    console.log('Found ' + stores.length + ' stores.');
    stores.map(function (store) {
        var clothing = randomClothing();
        var item = new db.Landmark({
            name: clothing,
            id: store.id + '_' + clothing + '_test_' + (Math.random() * 100000 | 0),
            world: false,
            parent: store.getSimpleItem(),
            valid: true,
            loc: {
                type: 'Point',
                coordinates: store.loc.coordinates
            },
            loc_info: {
                loc_nickname: 'Apparel',
                floor_num: Math.random() * 10 | 0
            },
            owner: random(users),
            itemTags: {
                text: [clothing]
            },
            price: (Math.random()*3|0) + 1,
            itemImageURL: ['https://s3.amazonaws.com/if-server-avatars/2', 'https://s3.amazonaws.com/if-server-avatars/2'],
            testData: true
        });
        item.saveAsync()
            .then(function(d) {
                console.log(d);
            })
            .catch(console.log.bind(console));
    });

    console.log('saved ' + stores.length  + ' stores.');
});



