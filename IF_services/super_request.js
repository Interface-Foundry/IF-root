'use strict';

var request = require('request'),
    async = require('async');

var num = process.argv[2];



function call(num) {
    var mapqurl = 'http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json'
    var response = {};
    async.whilst(
        function() {
            return num > 0;
        },
        function(callback) {
            request({
                url: mapqurl,
                qs: {
                    lat: 40.7410986,
                    lon: -73.9888682
                }
            }, function(err, res, body) {
                if (err) console.log(err);
                var data = JSON.parse(body);
                response = data.address.city;
                console.log('Requested ', num, ' times.', response)
                num--;

            })
            setTimeout(callback, 100);
        },
        function(err) {
            console.log('Requested a total of ',num,' times.')
        }
    );
}

call(num);