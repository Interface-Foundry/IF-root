var job = require('job');

var test = job('test-job', function(data, done) {
    console.log(JSON.stringify(data, null, 2));
    setTimeout(function() {
        done(null, 'wooooow');
    }, 1000);
})

test({a: 1, b:2});
test('sup');
test(1234567);
test([1, 2, 3, 4 ,5]);
test(function() {
    console.log('bitch please');
});
