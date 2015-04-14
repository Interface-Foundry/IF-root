var redis = require('redis');
var client = redis.createClient(global.config.redis.port, global.config.redis.url, global.config.redis.options);
 
client.on('connect', function() {
    console.log('connected to redis server');
});

module.exports = client;
