
var mongoose = require('mongoose');

  //schema construction
  var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

  var geozipSchema = new Schema({
    coords: [String],
    zipcode: String,
    valid: Boolean
  }); 


module.exports = mongoose.model('geozipModel', geozipSchema, 'geozip');