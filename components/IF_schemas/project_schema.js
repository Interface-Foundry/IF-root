var mongoose = require('mongoose');


	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var projectSchema = new Schema({

		worldID: Schema.Types.ObjectId,
		styleID: Schema.Types.ObjectId,
		permissions: {
			ownerID: Schema.Types.ObjectId,
			viewers: [Schema.Types.ObjectId],
			editors: [Schema.Types.ObjectId]
		},
		avatar: String,
		time: {
			created: { type: Date, default: Date.now },
			lastedited: { type: Date, default: Date.now}
		}
	}); 



module.exports = mongoose.model('projectModel', projectSchema, 'projects');
