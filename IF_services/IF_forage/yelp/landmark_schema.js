


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


module.exports = {
    _schema: null,

    _schema_def: {
       name: String, 
		//id: String, 
	  	lat: Number,
	  	lon: Number,
	  	summary:String,
		description: String, 
		avatar:String,
		categories:Schema.Types.Mixed,
		source_yelp: {
				id: String,
				is_closed: String,
				is_claimed: String,
				url: String,
				mobile_url: String,
				phone: String,
				display_phone: String,
				rating: Schema.Types.Mixed,
				snippet_image_url: String,
				deals:Schema.Types.Mixed,
				reviews:Schema.Types.Mixed
			
			
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