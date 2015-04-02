'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request'),
    _ = require('underscore');

router.use(function(req, res, next) {
    if (req.query.hasloc || req.query.lat || req.query.lng) {
        next();
    }
});

router.get('/', function(req, res) {
    //because the request library also uses 'res'...
    var response = res;

    var geoloc = {};

    if (!req.query.hasloc) {
        //Freegeoip allows up to 10,000 queries per hour by default. 
        var geoipurl = 'http://freegeoip.net/json/' + req.ip;

        request({
            url: geoipurl
        }, function(err, body) {
            if (err) console.log(err);
            var data = JSON.parse(body);
            geoloc.name = data.region_name;
            geoloc.lat = data.latitude;
            geoloc.lng = data.longitude;
            response.send(geoloc);
        })

    } else if (req.query.lat && req.query.lng) {
        //supposedely no limit..
        var mapqurl = 'http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json'

        request({
            url: mapqurl,
            qs: {
                lat: req.query.lat,
                lon: req.query.lng
            }
        }, function(err, res, body) {
            if (err) console.log(err);
            var data = JSON.parse(body);
            geoloc.name = data.address.city;
            response.send(geoloc);
        })
    }

})

module.exports = router;