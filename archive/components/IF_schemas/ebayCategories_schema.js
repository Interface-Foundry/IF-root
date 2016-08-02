var mongoose = require('mongoose');

//schema construction
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var ebayCategorySchema = new Schema({
    CategoryID: String,
    CategoryLevel: Number,
    CategoryName: String,
    CategoryParentID: String,
    CategoryNamePath: String,
    CategoryIDPath: String,
    LeafCategory: Boolean,
    children: []
});


module.exports = mongoose.model('ebayCategory', ebayCategorySchema, 'ebayCategory');