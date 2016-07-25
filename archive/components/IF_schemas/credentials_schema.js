var mongoose = require('mongoose');

//schema construction
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var credentialsSchema = new Schema({
    name: String,
    shop: String,
    client_id: String,
    client_secret: String,
    token: String,
    vendor: String
});


module.exports = mongoose.model('credentials', credentialsSchema, 'credentials');