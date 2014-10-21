var mongoose = require('mongoose'),
textSearch = require('mongoose-text-search');
monguurl = require('monguurl');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var landmarkSchema = new Schema({
		name: String, 
		id: { type: String, unique: true},
		world: Boolean,
		parentID: String,
		valid: Boolean, //are all req. items inputted
		status: String, //'draft' 'archived' 'public'
		avatar: String,
		hasLoc: Boolean,
		loc: { //user inputted loc
	    	type: {
	      		type: String //GeoJSON-'point'
	    	},
	    	coordinates: []
	  	},
	  	loc_nickname: String,
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
		subType: { type: [String], index: true }, // type of event/place	
		category: String, //category of type
		landmarkCategories: [{
			name: String 
		}],
		style: {
			styleID: String, //link to landmark's style
			maps: {
				type: { type: String }, //cloud, local, or both -- switch
				cloudMapID: String,
				cloudMapName: String,
				localMapID: String,
				localMapName: String,
		        localMapOptions: {
		            attribution: String,
		            minZoom: Number,
		            maxZoom: Number,
		            reuseTiles: Boolean,
		            tms: Boolean //needed for tile server renders
		        }
			},
			markers: {
				name: String,
				category: String
			}	
		},
		hasTime: Boolean,
		time: {
			created: { type: Date, default: Date.now },
			start: { type: Date},
			end: { type: Date},
			timezone: String
		},
		timetext: {
			datestart: String,
			dateend: String,
			timestart: String,
			timeend: String
		},
		views: Number,
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
		updated_time: Date, // TO DO
		// source_fb: { //source of data bubble (is facebook event api)
		// 	is_source: Boolean,
		// 	id: String,
		// 	cover: {
		// 		id: String,
		// 		source: String,
		// 		offset_y: Number,
		// 		offset_x: Number
		// 	},
		// 	owner: String,
		// 	parent_group: String,
		// 	privacy: String,
		// 	ticket_uri: String,
		// 	updated_time: Date,
		// 	venue: String
		// },
		source_meetup_on: Boolean,
		source_meetup: {
			id: { type: String, unique: true},
			status: String,
			visibility: String,
			updated: Number,
			event_hosts: [Schema.Types.Mixed],
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
		},
		widgets: {
			twitter: Boolean,
			instagram: Boolean,
			upcoming: Boolean,
			category: Boolean,
			googledoc: Boolean,
			checkin: Boolean
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