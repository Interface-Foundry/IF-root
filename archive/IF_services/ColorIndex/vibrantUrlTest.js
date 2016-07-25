//var Vibrant = require('node-vibrant');
var Vibrant = require('../../../../code/node-vibrant');
var should = require('chai').should();
var https = require('https');
var http = require('http');
var fs = require('fs');

var u = 'https://s3.amazonaws.com/if.kip.apparel.images/annas2198/2de2cf2c-61f9-4ada-b770-6a572898e432_m.jpg'
u = 'http://ecdn2.shoptiques.net/products/pinkyotto-summertime-slip-dress-d6c7a9cb_m.jpg';


if (u.indexOf('http') === 0) {
    http.get(u, function(r) {
        var buff = new Buffer('');
        var i = 0;
        r.on('data', function(data) {
            i++
            buff = Buffer.concat([buff, data]);
        })
        r.on('end', function() {
            console.log(buff);
            fs.writeFileSync('image.jpg', buff);
            console.log(i, 'concats')
        })
    })
}

var v = new Vibrant(u)// 'https://s3.amazonaws.com/if.kip.apparel.images/annas2198/2de2cf2c-61f9-4ada-b770-6a572898e432_m.jpg');
v.getSwatches(function(e, s) {
    //should.eql(e, null);
    s.should.be.an.object;
    console.log(s);
});
