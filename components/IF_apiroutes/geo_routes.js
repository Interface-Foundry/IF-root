'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request'),
    _ = require('underscore');

var mapboxURL = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places/',
    mapqURL = 'http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json',
    mapboxKey = 'pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw',
    geoipURL = 'http://127.0.0.1:8080/json/' //local freegeoip server, will change based on current IP;

router.use(function(req, res, next) {
    req.geoloc = {};
    console.log('hitting middle ware, req.query is.. ', req.query, 'req.ip is.. ', req.ip)
        //Because the request library also uses 'res' we'll rename the response here
    var response = res;
    //query the local freegeoip server we are running 
    //if hasLoc=true, geoloc.cityName will be overwritten using the more accurate lat lng 
    //for now use the less accurate ip based cityName
    request({
        url: geoipURL + '192.30.252.128'
    }, function(err, res, body) {
        if (err) console.log(err);
        console.log('body is..', body)
        var data = JSON.parse(body);
        if (data.city == null) {
            req.geoloc.cityName = 'My Location'
        } else {
            req.geoloc.cityName = data.city;
        }
        req.geoloc.lat = data.latitude;
        req.geoloc.lng = data.longitude;

        console.log('ip based geoloc is', req.geoloc)
        return next();
    })


});

router.get('/', function(req, res) {
    var response = res;

    if (req.query.hasLoc && req.query.lat && req.query.lng) {
        req.geoloc.lat = req.query.lat;
        req.geoloc.lng = req.query.lng;
        request({
            url: mapqURL,
            qs: {
                lat: req.query.lat,
                lon: req.query.lng
            }
        }, function(err, res, body) {
            var data = JSON.parse(body);
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
                    req.geoloc.cityName = data.features[1].text;
                    req.geoloc.src = 'mapbox';
                    console.log('Mapbox based result geoloc is..', req.geoloc)
                    response.send(req.geoloc);
                })
            } else {
                //Otherwise query mapquest
                if (data.address) {
                    var data = JSON.parse(body);

                    if (data.address.city) {
                        if (data.address.city == 'NYC') {
                            data.address.city = 'New York City'
                        }
                        req.geoloc.cityName = data.address.city;
                    }
                    if (data.address.village) {
                        req.geoloc.cityName = data.address.village;
                    }
                    req.geoloc.src = 'mapquest';
                    console.log('Mapquest based result geoloc is..', req.geoloc)
                    response.send(req.geoloc);
                } else {
                    console.log('Location not found in Mapquest, using ip based city')
                }
            }
        })
    } else if (req.query.hasLoc == 'false' && !req.query.lat && !req.query.lng) {
        console.log('If user id not provide geoloc coordinates.. ip-based req.geoloc is..', req.geoloc)
        req.geoloc.src = 'ip-based';
        response.send(req.geoloc);
    } else {
        console.log('Incorrect query..', req.query)
        res.sendStatus(404);
    }
})

module.exports = router;