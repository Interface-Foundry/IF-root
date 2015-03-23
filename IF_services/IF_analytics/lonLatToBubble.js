var mongoose = require('mongoose');
var Landmark = require('_if_/components/IF_schemas/landmark_schema');

/**
 * Returns the bubble that best matches this lon/lat or null if none exists
 * TODO handle floors
 * @type {Function}
 * @param lonlat [longitude, latitude] pair
 * @paam cb callback(err, bubble)
 */
var lonLatToBubble = module.exports = function(lonlat, cb) {
    // default geosearch is to be within 10m of the point.  cool??
    // we're scientists, not mathematicians.
    Landmark.aggregate(
        {
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": lonlat
                },
                "distanceField": "distance",
                "maxDistance": 10, //meters
                "spherical": true,
                "query": {
                    "world": true // bubbles only
                }
            }
        })
        .exec(function(err, landmarks) {
            if (err) {
                cb(err);
            } else if (landmarks.length === 0) {
                cb(null, null);
            } else if (landmarks.length > 1) {
                // what to do if there are multiple landmarks returned? include the most specific oe only
                // TODO
                cb(null, landmarks[0]);
            } else if (landmakrs.length == 1) {
                cb(null, landmarks[0]);
            } else {
                cb(new Error('Unexpected error getting bubble from lonlat'));
            }

        })
};
