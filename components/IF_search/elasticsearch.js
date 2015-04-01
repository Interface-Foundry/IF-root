//var express = require('express');
//var router = express.Router();
var elasticsearch = require('elasticsearch');
var RSVP = require('rsvp');

// logs elasticsearch stuff, flesh out later once we know what's useful
var ESLogger = function(config) {
	var defaultLogger = function(){};

	this.error = defaultLogger;
	this.warning = defaultLogger;
	this.info = defaultLogger;
	this.debug = defaultLogger;
	this.trace = defaultLogger;
	this.close = defaultLogger;
};


// todo production configuration
var es = new elasticsearch.Client({
	host: 'localhost:9200',
	log: ESLogger
});

module.exports = {};

// health check responds with error if es is down
module.exports.healthcheck = function(cb) {
	es.search({
		index: "if",
		type: "landmarks",
		body: {
			query: {
				match: {
					body: "food"
				}
			},
			size: 1 // one result is enough to prove it's up
		}
	}).then(function(res) {
		if (res.hits.hits.length > 0) {
			// yay search found something so it's up.
			cb();
		}
	}, function(err) {
		cb(err);
	});
};

// handles text searches.  gee looks easy to convert to an express route some day...
module.exports.search = function(req, res) {
	var q = req.quer.textQuery;
	var lat = req.query.userLat;
	var lng = req.query.userLng;
	var t = req.query.localTime;

	var fuzzyQuery = {
		"query": {
			"match": {
				"title": {
					"query": q,
					"fuzziness": 2, // do not increase
					"prefix_length": 1
				}
			}
		}
	};

	var fuzzy = es.search(fuzzyQuery);

	// TODO synonym query
	
	var synonymQuery = {
	};
	var synonym = es.search(synonymQuery);

	RSVP.hash({
		fuzzy: fuzzy,
		synonym: synonym
	}).then(function(results) {
		// Merge and sort the results
		var uniqueBubbles = {} // id is key
		results.fuzzy.hits.hits.map(function(b) {
			// each hit has a "searchResult" field which will
			// contain everything we need to give to angular
			b.searchResult.fuzzyScore = b.score;
			uniqueBubbles[b.searchResult.id] = b.searchResult;
		});

		results.synonym.hits.hits.map(function(b) {
			if (!uniqueBubbles[b.searchResult.id]) {
				uniqueBubbles[b.searchResult.id] = b.searchResult;
			}
			uniqueBubbes[b.searchResult.id].synonymScore = b.score;
		});

		// return weighted and sorted array
		// TODO filter on distance
		res.send(Object.keys(uniqueBubble).map(function(k) {
			return uniqueBubble[k];
		}).map(function(b) {
			b.score = 10*b.fuzzyScore + 5*b.synonymScore;
			return b;
		}).sort(function(a, b) {
			return a.score - b.score;
		}));
	});
};
