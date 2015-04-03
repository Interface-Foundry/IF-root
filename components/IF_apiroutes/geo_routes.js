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
    //Because the request library also uses 'res' we'll rename the response here
    var response = res;

    var geoloc = {};

    if (!req.query.hasloc) {
        //query the local freegeoip server running
        var geoipurl = 'localhost:8080/' + req.ip;
        request({
            url: geoipurl
        }, function(err, body) {
            if (err) console.log(err);
            var data = JSON.parse(body);
            geoloc.cityName = data.region_name;
            geoloc.lat = data.latitude;
            geoloc.lng = data.longitude;
            response.send(geoloc);
        })

    } else if (req.query.lat && req.query.lng) {
        //supposedely no limit no throttle...
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
            geoloc.cityName = data.address.city;
            geoloc.lat = data.lat;
            geoloc.lng = data.lon;
            response.send(geoloc);
        })
    }

})

module.exports = router;