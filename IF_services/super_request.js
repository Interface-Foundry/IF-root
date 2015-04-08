'use strict';

var request = require('request'),
    async = require('async'),
    redis = require("redis"),
    client = redis.createClient();

client.on("connect", function(err){
    if (err) console.log(err);

    console.log('Connected to test-redis')
})

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

                // Testing Redis
                var stringifiedObject = JSON.stringify(data);
                client.rpush('newlist', stringifiedObject , redis.print, function(err, reply) {
                    if (err) console.log(err);
                    console.log('redis reply: ', reply);
                });

                console.log('Requested ', num, ' times.', response)
                num--;

            })
            setTimeout(callback, 500);
        },
        function(err) {
            console.log('Finished!')

            var values = client.lrange('newlist',-100, 100, function(err, reply) {
                if (err) console.log(err);
                console.log(reply);
              
            });
            // console.log('values is..', values);
        }
    );
}

call(num);