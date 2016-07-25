var request = require('request');
var pythonEndpoint = 'http://localhost:9998/';
request = request.defaults({
    baseUrl: pythonEndpoint,
    json: true
});

/**
 * This module wraps a python http api for neighboord name finding given lat lon
 * @type {{}}
 */
module.exports = {
    findArea: function(lat, lon, callback) {
        request('findArea?lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon), function(e, r, body) {
            if (e) {
                console.log('WRAPPER ERROR: ', er) ;
                callback(e);
            }
            console.log('AAAAAA', e, r, body)
            callback(null, body);
        });
    }
};