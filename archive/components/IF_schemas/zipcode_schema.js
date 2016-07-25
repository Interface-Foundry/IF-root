var mongoose = require('mongoose');
// var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

var zipcodesSchema = mongoose.Schema({
    zipcode: String,
    city: String,
    state: String,
    neighborhood: String,
    loc: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: []
    },
    pop: Number,
    area: Number,
    density: Number,
    places: Number,
    items: Number,
    valid: Boolean
});


module.exports = mongoose.model('zipcodes', zipcodesSchema);
