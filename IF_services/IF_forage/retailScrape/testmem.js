var memoize = require('./memoize');
var Promise = require('bluebird');

var q = function(a) {
    console.log('calling with', a);
    return new Promise(function(resolve, reject) {
        resolve(a*12);
    })
}

var mq = memoize(q);

mq(2).then(function(r) {
    console.log(r);
})
mq(2).then(function(r) {
    console.log(r);
})
mq(12).then(function(r) {
    console.log(r);
})