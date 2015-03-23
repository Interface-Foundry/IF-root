var llb = require('./lonLatToBubble.js');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/if');

llb([0,0], function(err, bubble) {
  if (err) {
    console.log('error :<');
    return console.log(err);
  }

  console.log(bubble);
    process.exit(0);
});
