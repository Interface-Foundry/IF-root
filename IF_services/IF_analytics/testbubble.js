var llb = require('./lonLatToBubble.js');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/if');


var bubblePoint = [-73.9936362, 40.71499120000001];
var emptyPoint = [0, 0];



llb(emptyPoint, function(err, bubble) {
    if (err) {
        console.log('test failed');
        console.log(err);
    }

    if (bubble) {
        console.error('test failed bubble found');
        console.log(bubble);
    }
});


llb(bubblePoint, function(err, bubble) {
    if (err) {
        console.log('test failed');
        console.log(err);
    }

    if (!bubble) {
        console.error("test failed no bubble foud");
    }

    console.log(bubble);
});