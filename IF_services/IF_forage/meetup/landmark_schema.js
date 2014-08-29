/*var mongoose = require('mongoose');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var landmarkSchema = new Schema({
		name: String, 
		id: String, 
	  	lat: Number,
	  	lon: Number,
		description: String, 
		time: {
			start: { type: Date},
			end: { type: Date}
		},
		source_meetup: {
			id: Number,
			status: String,
			visibility: String,
			updated: Number,
			venue: {
				id: Number,
				name: String,
				state: String,
				address_1: String,
				address_2: String,
				city: String,
				zip: Number,
				country: String,
				phone: String,
			},
			fee: {
				amount: Number,
				description: String,
				label: String,
				required: String,
				accepts: String,
				currency: String	
			},
			yes_rsvp_count: Number,
			rsvp_limit: Number,
			event_url: String,
			how_to_find_us: String,
			group: {
				id: Number,
				name: String,
				who: String,
				group_lat: Number,
				group_lon: Number
			}
		}
	}); 


module.exports = mongoose.model('landmarkModel', landmarkSchema, 'landmarks');
*/


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


module.exports = {
    _schema: null,

    _schema_def: {
       name: String, 
		id: String, 
	  	lat: Number,
	  	lon: Number,
		description: String, 
		time: {
			start: { type: Date},
			end: { type: Date}
		},
		source_meetup: {
			id: String,
			status: String,
			visibility: String,
			updated: Number,
			venue: {
				id: Number,
				name: String,
				state: String,
				address_1: String,
				address_2: String,
				city: String,
				zip: Number,
				country: String,
				phone: String,
				zip:String
			},
			fee: {
				amount: Number,
				description: String,
				label: String,
				required: String,
				accepts: String,
				currency: String	
			},
			yes_rsvp_count: Number,
			rsvp_limit: Number,
			event_url: String,
			how_to_find_us: String,
			group: {
				id: Number,
				name: String,
				who: String,
				group_lat: Number,
				group_lon: Number
			}
		}
    },

    schema: function(){
        if (!module.exports._schema){
            module.exports._schema = new mongoose.Schema(module.exports._schema_def);
        }
        return module.exports._schema;
    },

    _model: null,

    model: function(new_instance){
        if (!module.exports._model){
            var schema = module.exports.schema();
            mongoose.model('landmarkSchema', schema);
            module.exports._model = mongoose.model('landmarkSchema');
        }

        return new_instance ?
            new module.exports._model() :
            module.exports._model;
    }
}