var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
	host: 'localhost:9200'
});

es.search({
	index: 'test',
	type: 'post',
	body: {
		query: {
			match: {
				body: "qri"
			},
		}
	}
}).then(function(res) {
	console.dir(res.hits.hits);
	// expected to return post with "qrion" in body
}, function(er) {
	console.error(er);
});

