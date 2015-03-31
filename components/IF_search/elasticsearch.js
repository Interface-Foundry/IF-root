var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var RSVP = require('rsvp');

// todo production configuration
var es = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});

// gets handles text searches
router.get('/search', function(req, res) {
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
	var synonym = es.searchsynonymQuery);

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
		res.send(Object.keys(uniqueBubble).map(function(k) {
			return uniqueBubble[k];
		}).map(function(b) {
			b.score = 10*b.fuzzyScore + 5*b.synonymScore;
			return b;
		}).sort(function(a, b) {
			return a.score - b.score;
		}));
	});
});
