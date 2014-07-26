//----MONGOOOSE----//
var mongoose = require('mongoose'),
   landmarkSchema = require('./landmark_schema.js');

mongoose.connect('mongodb://localhost/if');
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//
var userQuery = "asdf";


landmarkSchema.find(
    { $text : { $search : userQuery } },
    { score : { $meta: "textScore" } }
  ).
  sort({ score : { $meta : 'textScore' } }).
  limit(100).
  exec(function(error, documents) {
    console.log(documents);
  });

