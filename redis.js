var redis = require('redis');
var client = redis.createClient(config.redis.port, config.redis.url, config.redis.options);
 
client.on('connect', function() {
    console.log('connected to redis server');
});

client.on('error', function(err) {
	console.error('redis error');
	console.error(err);
});

module.exports = client;
