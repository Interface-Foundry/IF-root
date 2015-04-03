'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request'),
    _ = require('underscore');

var mapboxURL = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places/',
    mapqURL = 'http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json',
    mapboxKey = 'pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw',
    geoipURL = 'localhost:8080/' //local freegeoip server, probably will change

router.use(function(req, res, next) {
    //Because the request library also uses 'res' we'll rename the response here
    var response = res;
    if (req.query.hasloc || req.query.lat || req.query.lng) {
        console.log('hitting .use, geoloc is', geoloc)
        var geoloc = {};

        //query the local freegeoip server we are running 
        //if hasloc=true, geoloc.cityName will be overwritten using the more accurate lat lng 
        //for now use the less accurate ip based cityName
        request({
            url: geoipURL + req.ip
        }, function(err, body) {
            if (err) console.log(err);
            var data = JSON.parse(body);
            geoloc.cityName = data.region_name;
            geoloc.lat = data.latitude;
            geoloc.lng = data.longitude;
            response.send(geoloc);
        })
        next();
    }
});

router.get('/', function(req, res) {
    var response = res;
    console.log('hitting get /geolocation', req.query)

     if (req.query.hasloc && req.query.lat && req.query.lng) {
        request({
            url: mapqURL,
            qs: {
                lat: req.query.lat,
                lon: req.query.lng
            }
        }, function(err, res, body) {

            // 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places/{lon},{lat}.json?access_token=<your access token>'

            //If error res is 303 try mapbox instead
            if (err || res.statusCode == 303) {
                if (err) console.log(err);
                console.log('Mapquest didnt work. Querying Mapbox instead..', res.statusCode);
                request({
                    url: mapboxURL + req.query.lng + ',' + req.query.lat + '.json',
                    qs: {
                        access_token: mapboxKey
                    }
                }, function(err, body) {
                    if (err) console.log(err);
                    var data = JSON.parse(body);
                    geoloc.cityName = data.features[1].text;
                    console.log('Mapbox based result geoloc is..', geoloc)
                    response.send(geoloc);
                })
            } else {
                var data = JSON.parse(body);
                geoloc.cityName = data.address.city;
                console.log('Mapquest based result geoloc is..', geoloc)
                response.send(geoloc);
            }
        })
    } else {
        console.log('Something is missing in the query..', req.query)
    }
})

module.exports = router;