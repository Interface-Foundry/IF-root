var s = require('./searchForPlace');

s({lon: -74.0048541000000029, lat: 40.7331134999999875}, 'Rag & Bone', '104 Christopher St NY 10014')
.then(function(res) {
        console.log(res);
    }, function(err) {
        console.error(err);
    });