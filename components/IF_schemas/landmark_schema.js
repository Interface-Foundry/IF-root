var mongoose = require('mongoose');
//textSearch = require('mongoose-text-search');
var monguurl = require('monguurl');
var accounting = require('accounting');
var geolib = require('geolib');

//schema construction
var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    worldchatSchema = require('./worldchat_schema.js');

var landmarkSchema = new Schema({
    name: String,
    id: {
        type: String,
        unique: true,
        lowercase: true
    },
    world: {
      type: Boolean,
      index: true
    },
    parent: {
        mongoId: String,
        id: String,
        name: String
    },
    parents: [{
        type: ObjectId,
        ref: 'Landmark',
        index: true
    }],
    owner: {
        mongoId: String,
        profileID: String,
        name: String
    },
    avatar: String,
    loc: { //user inputted loc
        type: {
            type: String,
            default: 'MultiPoint'
        },
        coordinates: []
    },
    addressString: String,
    tel: String,
    description: String, //full HTML?
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
    views: Number,
    updated_time: {
        type: Date,
        default: Date.now
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
            type: String
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
    source_justvisual: {
        images: [{
          type: String,
          ref: 'JustVisual'
        }], // list of _ids for images
        keywords: [String] // list of keywords from search
    },
    source_cloudsight: {
      name: String,
      categories: [String] // warning /!\ often not present /!\
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
    linkbackname: {
      type: String, // the display name for the link
      index: true
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
        },
        classifierNameTags: [String],
        classifierDescTags: [String],
        classifiedCategory: String
    },
    flags: {
        mustUpdateElasticsearch: {
            type: Boolean,
            default: true
        },
        mustProcessImages: {
            type: Boolean,
            default: true
        },
        cloudsightProcessed: Boolean,
        mustRunClassifiers: Boolean,
        classifierFirstPassDone: Boolean,
        classifierCategoryDone: Boolean,
        needsGooglePlace: Boolean
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
    type: "text",
    landmarkCategories: "text",
    tags: "text"
});


var Landmark = module.exports = mongoose.model('Landmark', landmarkSchema, 'landmarks');

/**
 * selects only the fields necessary for front end
 */
Landmark.frontEndSelect = '-meta -flags -source_justvisual -source_cloudsight -source_generic_item -source_generic_store -source_instagram_post -source_instagram_user -source_shoptiques_item -source_shoptiques_store';

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

Landmark.priceStringToNumber = function(s) {
    return accounting.unformat(s);
};

Landmark.generateIdFromName = function(name) {
    if (!name) { name = 'item' + (Math.random()*1000000000|0).toString(32) }
    name = name.toLowerCase().replace(/[^\w^\d]/g, '');
    return name + '_' + (Math.random()*1000000000000000|0).toString(32);
}

/**
 * With multiple parents there are mutliple locations
 * but we only want to return one to the front end for some versions of the app
 * @param item
 * @param loc
 * @returns {*}
 */
Landmark.itemLocationHack = function(item, loc) {
    if (item.loc.type === 'MultiPoint') {
        item.loc.type = 'Point';

        // If there is no location to go by, choose a store for them
        // (this should not be the case for kipsearch.com)
        if (!loc) {
            // Randomize the coordinates
            // >_>
            // <_<
            // T_T
            item.loc.coordinates = item.loc.coordinates[Math.random()*item.loc.coordinates.length|0];
            item.otherLocations = [];
            return item;
        }

        var sortedPoints =
            item.loc.coordinates
                .map(function(c) {
                    return {
                        distance: geolib.getDistance({
                            latitude: loc.lat,
                            longitude: loc.lon
                        }, {
                            latitude: c[1],
                            longitude: c[0]
                        }),
                        lon: c[0],
                        lat: c[1]
                    }
                })
                .sort(function(a, b) {
                    return a.distance - b.distance;
                }).map(function(c) {
                    return [c.lon, c.lat]
                });
        item.loc.coordinates = sortedPoints[0];
        item.otherLocations = sortedPoints.slice(1);
    } else {
        item.otherLocations = [];
    }
    return item;
}
