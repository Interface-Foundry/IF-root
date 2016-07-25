var redis = require('redis');
global.config = require('./config');
var client = redis.createClient(global.config.redis.port, global.config.redis.url, global.config.redis.options);

client.on('connect', function () {
    console.log('connected to redis server', global.config.redis.url + ':' + global.config.redis.port);
});

client.on('error', function (err) {
    console.error('redis error');
    console.error(err);
});

module.exports = client;
