var mongoose = require('mongoose');


	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var projectSchema = new Schema({

		worldID: String,
		styleID: String,
		permissions: {
			ownerID: String,
			viewers: [String],
			editors: [String]
		},
		avatar: String,
		time: {
			created: { type: Date, default: Date.now },
			lastedited: { type: Date, default: Date.now}
		}

	}); 



module.exports = mongoose.model('projectModel', projectSchema, 'projects');
