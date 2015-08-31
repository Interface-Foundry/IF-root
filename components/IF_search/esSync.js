var db = require('db');
var elasticsearch = require('elasticsearch');
var config = require('config');

// logs elasticsearch stuff, flesh out later once we know what's useful
var ESLogger = function(config) {
    var defaultLogger = function() {};

    this.error = defaultLogger;
    this.warning = defaultLogger;
    this.info = defaultLogger;
    this.debug = defaultLogger;
    this.trace = defaultLogger;
    this.close = defaultLogger;
};
var es = new elasticsearch.Client({
    host: config.elasticsearch.url,
    log: ESLogger
});

var _ = require('lodash');

var types = [];

var esKipSchemaBase = {
    _id: {
        type: "string"
    },
    id: {
        type: "string"
    },
    name: {
        type: "string"
    },
    description: {
        type: "string"
    },
    location: {
        type: "string"
    },
    createdDate: {
        type: "date"
    },
    tags: {
        typs: 'string'
    },
    miscText: {
        type: "string"
    },
    popularity: {
        type: "double"
    }
}

var esItemSchema = _.merge({}, esKipSchemaBase, {
    geolocation: {
        type: "geo_point",
        source: 'loc.coordinates'
    },
    price: {
        type: 'float'
    },
    priceRange: {
        type: 'integer'
    },
    parentName: {
        type: 'string',
        source: 'parent.name'
    },
    ownerName: {
        type: 'string',
        source: 'owner.name'
    },
    categories: {
        type: 'string',
        index: 'not_analyzed',
        source: 'itemTags.categories'
    },
    tags: {
        source: function() {
            return _.flattenDeep([
                _.get(this, 'itemTags.text'),
                _.get(this, 'meta.humanTags.itemType'),
                _.get(this, 'meta.humanTags.itemStyle'),
                _.get(this, 'meta.humanTags.itemEvent'),
                _.get(this, 'meta.humanTags.itemDetail'),
                _.get(this, 'meta.humanTags.itemFabric')
            ]).filter(function(a) {
                return typeof a !== 'undefined';
            })
        }
    },
    // override some defaults from kipSchemaBase
    location: {
        source: 'addressString'
    },
    createdDate: {
        source: 'time.created'
    }
})

types.push({
    type: 'item',
    source: 'Landmark',
    properties: esItemSchema
});

var esLookSchema = _.merge({}, esKipSchemaBase, {
    ownerName: {
        type: 'string',
            source: 'owner.name'
    }
})

var esStoreSchema = _.merge({}, esKipSchemaBase, {
    geolocation: {
        type: "geo_point",
        source: 'loc.coordinates'
    },
    ownerName: {
        type: 'string',
        source: 'owner.name'
    }
})

var esUserSchema = _.merge({}, esKipSchemaBase, {
    id: {
        type: "string",
        source: 'profileID'
    }
})


function createIndexes() {
// todo
}


function GO() {
    db.Landmarks
        .find({
            'world': false,
            'flags.mustUpdateElasticsearch': {$ne: false}
        })
        .limit(20)
        .exec(function(e, landmarks) {
            if (e) {
                console.error(e);
                return;
            }
            if (landmarks.length === 0) {
                console.log('finished updating elasticsearch');
                process.exit(0);
            }

            var bulkBody = landmarks.reduce(function(body, l) {
                body.push({index: {_index: 'kip', _type: 'items', _id: l._id.toString()}})
                body.push(mongoToEs(esItemSchema, l))
                return body;
            }, [])

            es.bulk({
                body: bulkBody
            }, function(err, res) {
                if (err) {
                    console.error(err);
                }
                console.log(landmarks[0]._id.toString())

                db.Landmarks.update({
                    _id: {$in: landmarks.map(function(l) { return l._id;})}
                }, {'flags.mustUpdateElasticsearch': false}, {multi: true}, function(e, r) {
                    if (e) { console.error(e) }

                    process.nextTick(function() {
                        GO();
                    })
                })
            })

        })
}

GO();

function mongoToEs(schema, doc) {
    return Object.keys(schema).reduce(function(esDoc, k) {
        var prop = schema[k];
        if (prop.type === 'object' && typeof prop.properties !== 'undefined') {
            esDoc[k] = mongoToEs(prop.properties, doc);
            return esDoc;
        }
        if (typeof prop.source === 'undefined') {
            esDoc[k] = doc[k]
        } else if (typeof prop.source === 'string') {
            esDoc[k] = _.get(doc, prop.source)
        } else if (typeof prop.source === 'function') {
            esDoc[k] = prop.source.call(doc);
        } else {
            console.error('source of unknown type');
        }
        return esDoc;
    }, {})
}

function indexTestDoc(doc) {
    var user = {
        id: 'pbrandt1',
        name: 'peter',
        description: 'peter is a fake person on the internet',
        location: 'Washington, DC',
        faves: ['1', '1345', 'asdfghlk1']
    }

    var item = {

    }

    var stpore = {
        "_id" : "55a758b81a026e77067c9eef",
        "source_shoptiques_store" : {
            "id" : 1525,
            "idString" : "1525",
            "followersCount" : "672",
            "image" : "http://ecdn2.shoptiques.net/boutiques/97e8697e-093a-4a46-b825-b6b5615d3854_l.jpg",
            "description" : "\r\n\tUnique clothing and accessories for women. \r\n",
            "state" : "NJ",
            "city" : "Passaic",
            "addressText" : "156 Main Avenue, Passaic",
            "neighborhood" : "New Jersey",
            "url" : "http://www.shoptiques.com/boutiques/Pink-Orchid",
            "name" : "Pink Orchid",
            "source" : "shoptiques"
        },
        "name" : "Pink Orchid",
        "id" : "pinkorchid1525",
        "comments" : [],
        "rejects" : [],
        "faves" : [],
        "tags" : [],
        "loc" : {
            "type" : "Point",
            "coordinates" : [
                -74.1286233999999951,
                40.8444367999999969
            ]
        },
        "__v" : 0
    }
}