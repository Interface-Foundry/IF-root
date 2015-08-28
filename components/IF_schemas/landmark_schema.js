var mongoose = require('mongoose');
//textSearch = require('mongoose-text-search');
monguurl = require('monguurl');
var accounting = require('accounting');

//schema construction
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID,
    worldchatSchema = require('./worldchat_schema.js');

var landmarkSchema = new Schema({
    name: String,
    id: {
        type: String,
        unique: true,
        lowercase: true
    },
    world: Boolean,
    parent: {
        mongoId: {
            type: String,
            index: true
        },
        name: String,
        id: String
    },
    parentID: {
       type: String,
       index: true
   },
    owner: {
        mongoId: {
            type: String,
            index: true
        },
        profileID: String,
        name: String
    },
    valid: Boolean, //are all req. items inputted
    status: String, //'draft' 'archived' 'public'
    avatar: String,
    hasLoc: Boolean,
    loc: { //user inputted loc
        type: {
            type: String,
            default: 'Point' //GeoJSON-'point'
        },
        coordinates: []
    },
    addressString: String,
    tel: String,
    loc_nickname: String,
    loc_info: {
        loc_nickname: String,
        floor_num: {
            type: Number,
            index: true
        },
        floor_name: String,
        room_id: String, //future mapping by unique room hash
        room_name: String
    },
    // loc_nickname : {  //for places using nickname i.e. "BASECAMP" with static loc. populate as drop down after nickname add for user select more
    //  name: String,
    //  type: {
    //          type: String
    //      },
    //      coordinates: []
    // },
    summary: String,
    description: String, //full HTML?
    type: String, //event, place
    subType: {
        type: [String],
        index: true
    }, // type of event/place   
    category: { //only for landmarks (world:false)
        name: {
            type: String,
            index: true
        },
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
            type: {
                type: String
            }, //cloud, local, or both -- switch
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
        created: {
            type: Date,
            default: Date.now
        },
        start: {
            type: Date
        },
        end: {
            type: Date
        },
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
    splash_banner: {
        imgSrc: String,
        linkUrl: String
    },
    permissions: {
        ownerID: {
            type: String,
            index: true
        },
        hidden: Boolean,
        viewers: [String],
        admins: [String]
    },
    updated_time: Date, // TO DO
    // source_fb: { //source of data bubble (is facebook event api)
    //  is_source: Boolean,
    //  id: String,
    //  cover: {
    //      id: String,
    //      source: String,
    //      offset_y: Number,
    //      offset_x: Number
    //  },
    //  owner: String,
    //  parent_group: String,
    //  privacy: String,
    //  ticket_uri: String,
    //  updated_time: Date,
    //  venue: String
    // },
    source_meetup_on: Boolean,
    source_meetup: {
        id: {
            type: String,
            index: true
        },
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
            zip: String
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
        place_id: String,
        types: [String],
        address: String,
        international_phone_number: String,
        icon: String,
        opening_hours: [String],
        website: String,
        city: String,
        url: String,
        price_level: Number,
        neighborhood: String
    },
    source_yelp_on: Boolean,
    source_yelp: {
        id: {
            type: String,
            index: true
        },
        is_closed: String,
        is_claimed: String,
        url: String,
        mobile_url: String,
        phone: String,
        display_phone: String,
        rating: Schema.Types.Mixed,
        snippet_image_url: String,
        deals: Schema.Types.Mixed,
        locationInfo: Schema.Types.Mixed,
        categories: Schema.Types.Mixed,
        business_image_l: String,
        business_image_sm: String,
        business_image_md5: String,
        rating_image: String
    },
    source_instagram_user: {},
    source_instagram_post: {
        id: String,
        created_time: Number, // the created time on Instagram, utc timestamp
        img_url: String, // Assuming this is the low resolution
        original_url: String, // Assuming this is the original size
        local_path: [String], // There could be multiple images being saved
        text: {
            type: String
        },
        tags: [{
            type: String,
            index: true
        }],
        created: { // the time it was posted to Kip
            type: Date,
            default: Date.now
        }
    },
    source_shoptiques_item: {},
    source_shoptiques_store: {},
    source_generic_item: {},
    source_generic_store: {},
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
    tags: {
        type: [String],
        index: true
    }, //search tags
    price: Number, // example 59.99 (in USD)
    priceRange: Number, // example 1, 2, 3, or 4 for $, $$, $$$, $$$$
    faves: [{
        userId: String,
        timeFaved: Date
    }],
    fave_count: Number,
    rejects: [{
        userId: String,
        timeRejected: Date
    }],
    reject_count: Number,
    comments: [{
        user: {
            mongoId: String,
            profileID: String,
            name: String,
            avatar: String
        },
        comment: String,
        timeCommented: Date
    }],
    itemTags: {
        colors: [],
        categories: [],
        text: [],
        auto: []
    },
    itemImageURL: [String],
    reports: [{
        reporterUserId: String,
        timeReported: Date,
        comment: String,
        reason: String
    }],
    linkback: String, // linking back to a page you may have found an item
    linkbackname: String, // the display name for the link

    // make it easy to kill test data
    testData: {
        type: Boolean,
        default: false
    },

    // Additional processing data
    meta: {
        humanTags: {
            taggedBy: String,
            itemType: String,
            itemStyle: String,
            itemEvent: String,
            itemDetail: String,
            itemFabric: String,
            colors: [] // array of hsl values (so array of vectors)
        }
    },
    flags: {
        humanProcessed: Boolean,
        humanProcessedTime: Date
    }




}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

landmarkSchema.index({
    loc: '2dsphere'
});

landmarkSchema.virtual('parentName').set(function(name) {
    return name;
});

//instance method to get comments
landmarkSchema.methods.getComments = function(cb) {
    worldchatSchema.find({
        'roomID': this._id
    }, cb)
};

// gets a simple json rep of the item for thumbnails etc
landmarkSchema.methods.getSimpleItem = function() {
    return {
        mongoId: this._id.toString(),
        id: this.id,
        name: this.name,
        itemImageURL: this.itemImageURL
    }
};

//indexing for search
landmarkSchema.index({
    name: "text",
    description: "text",
    summary: "text",
    type: "text",
    loc_nickname: "text",
    landmarkCategories: "text",
    tags: "text"
});


var Landmark = module.exports = mongoose.model('landmarkModel', landmarkSchema, 'landmarks');

/**
 * Returns the number of dollar signs indicating the expensiveness of a price.
 * example 69.99 returns 2
 * @param p
 * @returns {number}
 */
Landmark.priceToPriceRange = function(p) {
    if (typeof p === 'undefined') {
        return p;
    } else if (typeof p === 'string') {
        p = accounting.unformat(p);
    }

    if (p < 50) {
        return 1;
    } else if (p < 100) {
        return 2;
    } else if (p < 200) {
        return 3;
    } else {
        return 4;
    }
};

Landmark.generateIdFromName = function(name) {
    if (!name) { name = 'item' + (Math.random()*1000000000|0).toString(32) }
    name = name.toLowerCase().replace(/[^\w^\d]/g, '');
    return name + '_' + (Math.random()*1000000000000000|0).toString(32);
}