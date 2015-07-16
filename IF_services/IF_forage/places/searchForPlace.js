var request = require('request');
var Promise = require('bluebird');


var key = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';
var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=$KEY&location=$LAT,$LON&radius=100'
    .replace('$KEY', key);

/**
 * Returns the best guess google place
 * @param loc Object {lat: lat, lon: lon}
 * @param name String
 * @param address String
 * @returns Promise google_place object
 */
module.exports = function(loc, name, address) {
    return new Promise(function(resolve, reject) {
        if (!loc || !loc.lat || !loc.lon) {
            return reject('loc is required and should be {lat: lat, lon: lon}');
        }

        url = url.replace('$LAT', loc.lat)
            .replace('$LON', loc.lon);

        if (name && typeof name === 'string') {
            url += '&name=' + name;
        }

        if (address && typeof address === 'string') {
            url += '&keyword=' + address;
        }

        request.get(url, {json: true}, function(e, r, body) {
            if (body.results && body.results.length > 0) {

                // resolve with the first good one
                var place = body.results.reduce(function(p, o) {
                    if (p) { return p; }

                    if (o.name && o.place_id) {
                        return o;
                    }
                });

                if (place) {
                    resolve(place);
                } else {
                    reject({message: 'no place found', failePlaces: body.results});
                }
            } else {
                reject({message: 'no place found', failedPlaces: body.results});
            }
        });
    });
};
