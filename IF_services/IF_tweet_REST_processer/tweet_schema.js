	var mongoose = require('mongoose');

	//var safe = {j: 1, getLastError: 1, _id:false}; //for testing DB

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	//social media schemas
	var twitterSchema = new Schema({
		tweetID: {type: Number, index: { unique: true }},
		tweetID_str: String,
		user:{
			name: String,
			screen_name: String,
			userId: Number,
			userId_str: String,
			profile_image_url: String
		},
		media:{
			media_type: String,
			media_url: String
		},
		text: { type: String, index: true },
		hashtags:[String],

		created: { type: Date, default: Date.now }
		//_id: Schema.Types.ObjectId,
		//geo: {type: String, coordinates: [Number]}
	});

twitterSchema.index({hashtags:1});

module.exports = twitterSchema;