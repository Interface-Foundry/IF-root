var db = require('db');
var elasticsearch = require('elasticsearch');
var config = require('config');
var kip = require('kip');

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
        type: 'string'
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
    es.indices.delete({
        index: 'kip'
    }, function (e) {
        var body ={ mappings: {
            items:
            {
                properties: schemaToMapping(esItemSchema)
            }
        }};
        kip.prettyPrint(body);
        es.indices.create({
            index: 'kip',
            body: body
        }, function(e) {
            if (kip.err(e)) return;
            console.log('created new mapping for items')
            db.Landmarks.update({world: false}, {'flags.mustUpdateElasticsearch': true}, {multi: true}, function() {
                console.log('marked all existing items for update');
                GO();
            })
        })
    })
}

function schemaToMapping(schema) {
    var s = _.cloneDeep(schema);
    return Object.keys(s).reduce(function(mapping, k) {
        var prop = s[k];
        if (prop.type === 'object' && typeof prop.properties !== 'undefined') {
            mapping[k] = schemaToMapping(prop.properties);
            return mapping;
        }
        delete prop.source;
        mapping[k] = prop;
        return mapping;
    }, {})
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

if (process.argv[2] === 'rebuild') {
    createIndexes();
} else {
    GO();
}

/*
also, here's what you'll want in your crontab if you use crontabs

* * * * * node /home/ubuntu/IF-root/components/IF_search/esSync 2>&1 >>/home/ubuntu/esSync.log
0 0 * * * rm /home/ubuntu/esSync.log

 */