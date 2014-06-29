var mongoose = require('mongoose'),
textSearch = require('mongoose-text-search');
monguurl = require('monguurl');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var landmarkSchema = new Schema({
		name: String, 
		id: String, 
		world: Boolean,
		parentID: String,
		valid: Boolean, //are all req. items inputted
		avatar: String,
		loc: { //user inputted loc
	    	type: {
	      		type: String
	    	},
	    	coordinates: []
	  	},
	  	// loc_nickname : {  //for places using nickname i.e. "BASECAMP" with static loc. populate as drop down after nickname add for user select more
	  	// 	name: String,
	  	// 	type: {
	   //    		type: String
	   //  	},
	   //  	coordinates: []
	  	// },
		summary: String,
		description: String, //full HTML?
		type: String, //event, place
		subType: String, // type of event/place	
		category: String, //category of type
		style: {
			styleID: String, //link to landmark's style
			maps: {
				type: { type: String }, //cloud, local, or both -- switch
				cloudMapID: String,
				cloudMapName: String,
				localMapID: String,
				localMapName: String
			},
			markers: {
				name: String,
				category: String
			}	
		},
		time: {
			created: { type: Date, default: Date.now },
			start: { type: Date},
			end: { type: Date}
		},
		timetext: {
			datestart: String,
			dateend: String,
			timestart: String,
			timeend: String
		},
		stats: { 
			relevance: Number,
			activity: Number,
			quality: Number	
		},
		resources: {
			hashtag: String,
			video: String,
			extraURL: String,
			etherpad: String,	
		},
		permissions: {
			ownerID: String,
			hidden: Boolean,
			viewers: [String],
			admins: [String]
		},
		tags: [String] //search tags
	}); 

	landmarkSchema.plugin(textSearch);

	landmarkSchema.index({loc:'2dsphere'});
	// landmarkSchema.index({loc_nickname:'2dsphere'});

	//indexing for search
	landmarkSchema.index({
	    name  				  :"text",
	    description           :"text",
	    shortDescription      :"text",
	    type                  :"text",
	    loc_nicknames         :"text"
	});

	// landmarkSchema.plugin(monguurl({
	// 	length: 40,
	// 	source: 'name',
	// 	target: 'id'
	// }));

module.exports = mongoose.model('landmarkModel', landmarkSchema, 'landmarks');
