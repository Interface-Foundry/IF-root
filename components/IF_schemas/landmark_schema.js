var mongoose = require('mongoose');
//textSearch = require('mongoose-text-search');
monguurl = require('monguurl');

	//schema construction
	var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

	var landmarkSchema = new Schema({
		name: String, 
		id: { type: String, unique: true},
		world: Boolean,
		parentID: { type: String, index: true},
		valid: Boolean, //are all req. items inputted
		status: String, //'draft' 'archived' 'public'
		avatar: String,
		hasLoc: Boolean,
		loc: { //user inputted loc
	    	type: {
	      		type: String, default: 'Point' //GeoJSON-'point'
	    	},
	    	coordinates: []
	  	},
	  	loc_nickname: String,
	  	loc_info: {
	  		loc_nickname: String,
	  		floor_num: { type: Number, index: true },
	  		floor_name: String,
	  		room_id: String, //future mapping by unique room hash
	  		room_name: String
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
		subType: { type: [String], index: true }, // type of event/place	
		category: { //only for landmarks (world:false)
			name: { type: String, index: true}, 
			avatar: String,
			hiddenPresent: Boolean
		},
		landmarkCategories: [{
			name: String,
			avatar: String,
			present: Boolean  
		}],
		style: {
			styleID: String, //link to landmark's style
			maps: {
				type: { type: String }, //cloud, local, or both -- switch
				cloudMapID: String,
				cloudMapName: String,
				localMapArray: [Schema.Types.Mixed],
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
			external_calendar: String
		},
		permissions: {
			ownerID: { type: String, index: true},
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
			id: { type: String, index: true},
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
		source_google_on: Boolean,
		source_google: {
			placeID: String,
			icon: String,
			opening_hours: [Schema.Types.Mixed],
			weekday_text: [String],
			international_phone_number: String,
			price_level: Number,
			reviews: [Schema.Types.Mixed],
			url: String, //google's key is just url
			website: String,
			types: [String],
			utc_offset: Number,
			vicinity: String
		},
		source_yelp_on: Boolean,
		source_yelp: {
			id: { type: String, index: true},
			is_closed: String,
			is_claimed: String,
			url: String,
			mobile_url: String,
			phone: String,
			display_phone: String,
			rating: Schema.Types.Mixed,
			snippet_image_url: String,
			deals:Schema.Types.Mixed,
			locationInfo:Schema.Types.Mixed,
			categories:Schema.Types.Mixed,
			business_image_l: String,
			business_image_sm: String,
			business_image_md5: String,
			rating_image: String
		},
		widgets: {
			twitter: Boolean,
			instagram: Boolean,
			upcoming: Boolean,
			category: Boolean,
			googledoc: Boolean,
			checkin: Boolean,
			presents: Boolean,
			streetview: Boolean
		},
		presents: {
			final_kind: String,
			final_name: String,
			final_avatar: String,
			final_count: Number
		},
		tags:  { type: [String], index: true }  //search tags
	}); 

	landmarkSchema.index({loc:'2dsphere'});

	//indexing for search
	landmarkSchema.index({
	    name  				  :"text",
	    description           :"text",
	    summary               :"text",
	    type                  :"text",
	    loc_nickname          :"text",
	    landmarkCategories    :"text",
	    tags 				  :"text"
	});


module.exports = mongoose.model('landmarkModel', landmarkSchema, 'landmarks');