'use strict';

var request = require('request'),
    async = require('async'),
    redis = require("redis"),
    client = redis.createClient(),
    config = require('../config'),
    geoipURL = config.geoipURL;

client.on("connect", function(err) {
    if (err) console.log(err);

    console.log('Connected to test-redis')
})

var num = process.argv[2];
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('environment is..', process.env.NODE_ENV)

function call(num) {

    var mapqurl = geoipURL
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

                if (!data.city) {
                    console.log('data.city is null! data is: ', data)
                } else {
                    console.log('data.city is NOT null! data is: ', data)
                }


                // Testing Redis
                // var stringifiedObject = JSON.stringify(data);
                // client.rpush('newlist', stringifiedObject, redis.print, function(err, reply) {
                //     if (err) console.log(err);
                //     console.log('redis reply: ', reply);
                // });

                // console.log('Requested ', num, ' times.', response)
                num--;
            })
            setTimeout(callback, 1000);
        },
        function(err) {
            console.log('Finished!')

            var values = client.lrange('newlist', -100, 100, function(err, reply) {
                if (err) console.log(err);
                console.log(reply);

            });
            // console.log('values is..', values);
        }
    );
}

call(num);