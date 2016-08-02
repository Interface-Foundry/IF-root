var redis = require('redis');
// Yo dawg spin up a redis instance on port 6380
// because i wanted to be able to just destroy this when done, so can't use existing redis
var port = 6380;
var client = redis.createClient(port, '127.0.0.1', {});

client.on('connect', function () {
    console.log('connected to redis server on port ' + port);
});

client.on('error', function (err) {
    console.error('redis error');
    console.error('BUT FIRST: make sure redis is runing on port ' + port);
    console.error(err);
});

module.exports = client;
