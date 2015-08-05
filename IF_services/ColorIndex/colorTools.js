var Vibrant = require('node-vibrant'); // make sure to npm install pbrandt1/node-vibrant
var Promise = require('bluebird');

/**
 * Finds the vibrant colors for an image
 * vibrant
 * @param url
 * @returns {Promise} {vibrant: {h: Hue, s: Saturation, l, Luminosity}}
 */
var getVibrantColors = function(url) {
    return new Promise(function(resolve, reject) {
        var v = new Vibrant(url);
        v.getSwatches(function(e, s) {
            if (e) {
                reject(e);
            }
            resolve(s);
        });
    });
};

/**
 * Gets the vibrant colors for all images in a landmark.
 * Does not save/mutate the landmark or access the db in any way
 * @param landmark
 * @returns {Promise} array of vibrant swatches
 *  [{Vibrant: ]
 */
var findColorsForLandmark = function(landmark) {
    console.log(landmark.itemImageURL);
    return Promise.settle(landmark.itemImageURL.map(function(url) {
        return getVibrantColors(url);
    })).then(function(results) {
        return results.reduce(function(colors, r) {
            if (r.isFulfilled()) {
                colors.push(r.value());
            }
            return colors;
        }, [])
    });
};

/**
 * Simple test
 */
var test = function() {
    var should = require('chai').should();

    //var url = 'https://s3.amazonaws.com/if.kip.apparel.images/annas2198/2de2cf2c-61f9-4ada-b770-6a572898e432_m.jpg';
    var url = '/Users/peter/Downloads/2899260_fpx.jpeg';
    getVibrantColors(url)
        .then(function (colors) {
            colors.should.have.property('Vibrant');
            console.log(colors.Vibrant);
        }).catch(console.error.bind(console));

    var db = require('db');
    db.Landmarks.findOne({'itemImageURL.0': {$exists: true}})
        .then(function(l) {
            var p = findColorsForLandmark(l);
            p.then(function(l) {
                console.log(l);
            }, function(e) {
                console.log(e);
            })
        }).then(function(colors) {
            colors.should.be.an.array;
            colors[0].should.have.property('Vibrant');
            console.log(colors);
        }, console.log.bind(console));
}

/**
 * Expose a both the main module and the test function
 * @type {{getImageHSL: Function, findColorsForLandmark: Function, test: Function}}
 */
module.exports = {
    getVibrantColors: getVibrantColors,
    findColorsForLandmark: findColorsForLandmark,
    test: test
};

// by default run tests if not require'd
if (!module.parent) {
    test()
}
