var Promise = require('bluebird');
var request = require('request-promise');

var googleAPI = 'AIzaSyBeTZb-NZUfVrUfDwmRXKY26bw1Mpmpjm8'; //'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';

var getAddressInfo = module.exports = function(address) {
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=$ADDRESS&key=$KEY'
        .replace('$KEY', googleAPI)
        .replace('$ADDRESS', address);
    return request.get(url);
};
