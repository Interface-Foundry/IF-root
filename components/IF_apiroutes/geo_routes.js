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

    //Because the request library also uses 'res' we'll rename the response here
    var response = res;
    //query the local freegeoip server we are running 
    //if hasLoc=true, geoloc.cityName will be overwritten using the more accurate lat lng 
    //for now use the less accurate ip based cityName
    request({
        url: geoipURL + '192.30.252.128'
    }, function(err, res, body) {
        if (err) console.log(err);
        // console.log('body is..', body)
        var data = JSON.parse(body);
        if (!data.city) {
            req.geoloc.cityName = 'My Location'
        } else {
            req.geoloc.cityName = data.city;
        }
        req.geoloc.lat = data.latitude;
        req.geoloc.lng = data.longitude;
        // console.log('router.use: req.query is: ', req.query, 'req.geoloc is.. ', req.geoloc)
        return next();
    })


});

router.get('/', function(req, res) {
    var response = res;

    if (req.query.hasLoc == 'true') {
        req.geoloc.lat = req.query.lat;
        req.geoloc.lng = req.query.lng;

        //MAPQUEST REQUEST
        request({
                url: mapqURL,
                qs: {
                    lat: req.query.lat,
                    lon: req.query.lng
                }
            }, function(err, res, body) {
                var data = JSON.parse(body);

                //MAPBOX SECTION
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
                        if (data.features[1].text) {
                            req.geoloc.cityName = data.features[1].text;
                            req.geoloc.src = 'mapbox';
                            console.log(req.geoloc)
                            response.send(req.geoloc);
                        } else {
                            req.geoloc.src = 'ip-based'
                        }
                    })
                } //END OF MAPBOX SECTION
                else {
                    //MAPQUEST 
                    if (data.address) {
                        if (data.address.city) {
                            if (data.address.city == 'NYC') {
                                data.address.city = 'New York City'
                            }
                            req.geoloc.src = 'mapquest';
                            console.log('hitting mapquest data.address.city', data)
                            req.geoloc.cityName = data.address.city;
                        } else if (data.address.village) {
                            req.geoloc.cityName = data.address.village;
                            console.log('hitting mapquest data.address.village', data)
                            req.geoloc.src = 'mapquest';
                        } else if (data.address.town) {
                            req.geoloc.cityName = data.address.town;
                            console.log('hitting mapquest data.address.town', data)
                            req.geoloc.src = 'mapquest';
                        } else {
                            console.log('mapquest could not find location name', data)
                            req.geoloc.src = 'ip-based';
                        }
                    } else {
                        req.geoloc.src = 'ip-based'
                        console.log('mapquest could not find location name', data)
                    }
                    console.log(req.geoloc)
                    response.send(req.geoloc);
                }

            }) //END OF MAPQUEST REQUEST
    } else {
        console.log('hasLoc = false, using ip based geoloc', req.geoloc)
        res.send(req.geoloc);
    }

})

module.exports = router;