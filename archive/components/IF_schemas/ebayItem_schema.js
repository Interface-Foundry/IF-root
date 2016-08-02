var mongoose = require('mongoose');

//schema construction
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var ebayItemSchema = new Schema({
    itemId: String,
    name: String,
    description: String,
    price: {},
    condition: {},
    src: String,
    images: [],
    category: String,
    details: [],
    mainTags: [],
    descriptionTags: []
});


module.exports = mongoose.model('ebayItem', ebayItemSchema, 'ebayItem');