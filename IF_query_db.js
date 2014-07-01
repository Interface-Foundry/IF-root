
//----MONGOOOSE----//
var mongoose = require('mongoose'),
   landmarkSchema = require('./landmark_schema.js');

mongoose.connect('mongodb://localhost/aicp');
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//

var express = require('express'), app = module.exports.app = express();

///////////
	
var userQuery = "petting zoo cat octopus";

var qw = { 
	// 'world':false
};


 landmarkSchema.find(qw, function(err, lm) {
  if (!lm)
    return next(new Error('Could not load Document'));

  else {

    console.log(lm);
  }
});  



// app.listen(3131, function() {
//     console.log("Chillin' on 3131 ~ ~");
// });