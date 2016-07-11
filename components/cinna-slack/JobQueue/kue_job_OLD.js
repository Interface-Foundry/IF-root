var kue = require('kue');
queue = kue.createQueue();

// UI
kue.app.listen(3000, function() {
    console.log('listening on port 3000');
}).on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
        console.log('already listening on port 3000');
    } else {
        console.log(e);
    }
});
kue.app.set('title', 'Jobs');

// API
/**
 * Create a job handler.
 *
 * var processImage = job('process-image', function(image, done){})
 * processImage(image);
 *
 * @param name
 * @param callback
 * @returns {Function}
 */
var job = module.exports = function(name, callback) {
    if (typeof callback === 'function') {
        queue.process(name, function (data, done) {
            callback(data.data, done);
        });
    }

    return function(data) {
        queue.create(name, data).save();
    }
};
