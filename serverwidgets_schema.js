var mongoose = require('mongoose');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var serverwidgetsSchema = new Schema({
		twitterTags: [Schema.Types.Mixed],
		instagramTags: [Schema.Types.Mixed]
	}); 

module.exports = mongoose.model('serverwidgetsModel', serverwidgetsSchema, 'serverwidgets');
