var mongoose = require('mongoose');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var serverwidgetsSchema = new Schema({
		worldID: String,
		worldTag: String,
		twitter: Boolean,
		instagram: Boolean
	}); 

module.exports = mongoose.model('serverwidgetsModel', serverwidgetsSchema, 'serverwidgets');
