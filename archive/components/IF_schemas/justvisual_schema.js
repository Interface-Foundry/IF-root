var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var justvisualSchema = new Schema({
  _id: String, // the justvisual id
  imageUrl: String,
  title: String,
  description: String,
  pageUrl: String,
  updated_time: {
      type: Date,
      default: Date.now
  }
});

justvisualSchema.index({
    loc: '2dsphere'
});

justvisualSchema.virtual('parentName').set(function(name) {
    return name;
});

var justvisual = module.exports = mongoose.model('JustVisual', justvisualSchema, 'justvisuals');
