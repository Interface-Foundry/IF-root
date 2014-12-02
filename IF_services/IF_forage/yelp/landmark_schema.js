var mongoose = require('mongoose'),
	textSearch = require('mongoose-text-search'),
	monguurl = require('monguurl'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


module.exports = {
    _schema: null,

    _schema_def: {
		name: String, 
		id: { type: String, unique: true},
		world: Boolean,
		parentID: { type: String, index: true},
		valid: Boolean, //are all req. items inputted
		archived: Boolean, //if object in archive or "live"
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
		category: { //only for landmarks (world:false)
			name: String, 
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
			ownerID: { type: String, index: true},
			hidden: Boolean,
			viewers: [String],
			admins: [String]
		},
		updated_time: Date, // TO DO
		source_fb: { //source of data bubble (is facebook event api)
			is_source: Boolean,
			id: String,
			cover: {
				id: String,
				source: String,
				offset_y: Number,
				offset_x: Number
			},
			owner: String,
			parent_group: String,
			privacy: String,
			ticket_uri: String,
			updated_time: Date,
			venue: String
		},
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
			business_image: String
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
		tags: [String] //search tags
    },

    schema: function(){
        if (!module.exports._schema){

            module.exports._schema = new mongoose.Schema(module.exports._schema_def);
            
			module.exports._schema.plugin(textSearch);
			module.exports._schema.index({loc:'2dsphere'});
			//indexing for search
			module.exports._schema.index({
			    name  				  :"text",
			    description           :"text",
			    shortDescription      :"text",
			    type                  :"text",
			    loc_nicknames         :"text"
			});

        }
        return module.exports._schema;
    },

    _model: null,

    model: function(new_instance){
        if (!module.exports._model){
            var schema = module.exports.schema();
            mongoose.model('landmarks', schema);
            module.exports._model = mongoose.model('landmarks');
        }

        return new_instance ?
            new module.exports._model() :
            module.exports._model;
    }
}