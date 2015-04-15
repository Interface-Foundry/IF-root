'use strict';

var express = require('express'),
    router = express.Router(),
    request = require('request'),
    _ = require('underscore');

var mapboxURL = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places/',
    mapqURL = 'http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json',
    mapboxKey = 'pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw';

var env = process.env.NODE_ENV || 'development';

router.use(function(req, res, next) {

    if (env == 'development' && req.query.hasLoc == 'false') {
        req.geoloc = {};
        console.log('In development mode, defaulting to NYC (hardcoded)')
        req.geoloc.cityName = 'New York City';
        req.geoloc.lat = 40.7393083;
        req.geoloc.lng = -73.9894285;
        res.send(req.geoloc)
        res.end()
        return
    }

    console.log('using geoip in route ' + req.originalUrl);
    if (req.header('x-forwarded-for')) {
        var ip = req.header('x-forwarded-for').split(',')[0]; // could be "99.12.2.222, 10.0.4.20"
    } else {
        ip = req.connection.remoteAddress;
    }

    if (global.config.env === 'development') {
        ip = global.config.ip; // use local real ip address in dev
    }

    req.geoloc = {};

    //Because the request library also uses 'res' we'll rename the response here
    var response = res;
    //query the local freegeoip server we are running 
    //if hasLoc=true, geoloc.cityName will be overwritten using the more accurate lat lng 
    //for now use the less accurate ip based cityName

    request(global.config.geoipURL + ip, function(err, res, body) {
        if (err) console.log(err);

        try {
            var data = JSON.parse(body);
        } catch (e) {
            console.error("Could not parse response from geoip server");
            console.error("server: " + global.config.geoipURL + ip);
            console.error(e);
            console.error(body);
            response.sendStatus(200);
            return;
        }

        // console.log('data is..', data)


        console.log('IP is..', ip)

        if (!data.city) {
            req.geoloc.cityName = 'New York City';
            req.geoloc.lat = 40.7393083;
            req.geoloc.lng = -73.9894285;
            console.log('ip-based data.city does not exist, data is: ', data, 'defaulting to NYC Flatiron.')
        } else {
            req.geoloc.cityName = data.city;
            // console.log('data.city is working properly, data is: ', data)
        }


        if (data.latitude && data.longitude) {
            if (data.latitude == 0 && data.longitude == 0) {
                console.log('incorrect lat lng supplied, data is: ', data, 'defaulting to NYC Flatiron.')
                req.geoloc.cityName = 'New York City';
                req.geoloc.lat = 40.7393083;
                req.geoloc.lng = -73.9894285;
            } else {
                req.geoloc.lat = data.latitude;
                req.geoloc.lng = data.longitude;
            }
        }
        console.log('router.use: req.query is: ', req.query, 'req.geoloc is.. ', req.geoloc)
        return next();
    })


});

router.get('/', function(req, res) {
    var response = res;

    if (req.query.hasLoc == 'true') {


        //MAPQUEST REQUEST
        request({
                url: mapqURL,
                qs: {
                    lat: req.query.lat,
                    lon: req.query.lng
                }
            }, function(err, res, body) {
                try {
                    var data = JSON.parse(body);
                } catch (e) {
                    console.error('could not parse response from mapquest');
                    console.error('server: ' + mapqURL);
                    console.error('lat: ' + req.query.lat + ' lng: ' + req.query.lng);
                    console.log(e);
                    console.log(body);
                }

                //MAPBOX SECTION
                if (err || res.statusCode !== 200) {
                    if (err) console.error(err);
                    console.error('Mapquest didnt work. Querying Mapbox instead..');
                    // console.log('Mapbox URL is: ', mapboxURL + req.query.lng + ',' + req.query.lat + '.json');
                    var url = mapboxURL + req.query.lng + ',' + req.query.lat + '.json';
                    request({
                        url: url,
                        qs: {
                            access_token: mapboxKey
                        }
                    }, function(err, res, body) {
                        if (err) console.error('Mapbox err is:', err);
                        try {
                            var data = JSON.parse(body);
                        } catch (e) {
                            console.error("could not parse mapbox json");
                            console.error("server: " + url);
                            console.error(e);
                            console.error(body);
                        }

                        if (data.features.length == 0) {
                            console.log('mapbox could not find location name, using ip-based location.', req.geoloc)
                            req.geoloc.src = 'ip-based'
                        } else if (data.features[1].text) {
                            req.geoloc.cityName = data.features[1].text;
                            //fix this
                            req.geoloc.lat = parseFloat(req.query.lat);
                            req.geoloc.lng = parseFloat(req.query.lng);

                            req.geoloc.src = 'mapbox';
                            console.log(req.geoloc)
                            response.send(req.geoloc);
                        } else {
                            console.log('Mapbox could not find location name, using ip-based location.', req.geoloc)
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
                                req.geoloc.lat = parseFloat(req.query.lat);
                                req.geoloc.lng = parseFloat(req.query.lng);
                            }
                            req.geoloc.src = 'mapquest';
                            // console.log('hitting mapquest data.address.city', data)
                            req.geoloc.cityName = data.address.city;
                        } else if (data.address.village) {
                            req.geoloc.cityName = data.address.village;
                            // console.log('hitting mapquest data.address.village', data)
                            req.geoloc.src = 'mapquest';
                            req.geoloc.lat = parseFloat(req.query.lat);
                            req.geoloc.lng = parseFloat(req.query.lng);
                        } else if (data.address.town) {
                            req.geoloc.cityName = data.address.town;
                            // console.log('hitting mapquest data.address.town', data)
                            req.geoloc.src = 'mapquest';
                            req.geoloc.lat = parseFloat(req.query.lat);
                            req.geoloc.lng = parseFloat(req.query.lng);
                        } else {
                            console.log('mapquest could not find location name', data)
                            req.geoloc.lat = parseFloat(req.query.lat);
                            req.geoloc.lng = parseFloat(req.query.lng);
                            req.geoloc.src = 'ip-based';
                        }
                    } else {
                        req.geoloc.src = 'ip-based'
                        req.geoloc.lat = parseFloat(req.query.lat);
                        req.geoloc.lng = parseFloat(req.query.lng);
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