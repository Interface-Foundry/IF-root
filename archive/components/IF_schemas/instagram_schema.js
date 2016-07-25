// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var instagramSchema = mongoose.Schema({
  objectID: { type: String, index: true },
  user: {
    name: String,
    screen_name: String,
    userId: Number,
    userId_str: Number,
    profile_image_url: String
  },
  img_url: String, // Assuming this is the low resolution
  original_url: String, // Assuming this is the original size
  local_path: [String], // There could be multiple images being saved
  text: { type: String },
  tags: [{ type: String, index: true }],
  created: {
    type: Date,
    default: Date.now
  }
});

instagramSchema.index({tags:1});

// create the model for users and expose it to our app
module.exports = mongoose.model('instagram', instagramSchema);