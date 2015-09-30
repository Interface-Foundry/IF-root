// var db = require('db');

// var stream = db.Landmarks.find({}).stream()
// stream.on('data', function(lm) {
//  console.log(lm._id);
// })



var db = require('db');

var stream = db.Landmarks
 .find({})
 .populate('parents')
 .stream()
stream.on('data', function(lm) {
 console.log(lm.name, lm.parents.map(function(p) {
   return p.addressString
 }));
})

//run NODE_ENV=digitalocean before indexitems.js (NODE_ENV=digitalocean node indexitems.js)