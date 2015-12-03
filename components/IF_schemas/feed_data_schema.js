var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var feedDataSchema = mongoose.Schema({
    file_path: String,
    captions: [String],
    source: String,
    imgSrc: String,
    type: String,
    data: {} // free-form data
});

module.exports = mongoose.model('feedData', feedDataSchema);