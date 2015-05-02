var mongoose = require('mongoose');
var Landmarks = require('./components/IF_schemas/landmark_schema');
var config = require('./config');
var fs = require('fs');

mongoose.connect(config.mongodb.url);

Landmarks.find({id: 'queens_center_mall'}, function(err, landmarks) {
  var qc = landmarks[0];
  fs.writeFileSync(__dirname + '/components/IF_search/queenscenter.js', "module.exports = " + JSON.stringify(qc));
  process.exit(0);
});
