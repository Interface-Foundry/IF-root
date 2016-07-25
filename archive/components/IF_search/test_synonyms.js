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
				body: "hot"
			},
		}
	}
}).then(function(res) {
	console.dir(res.hits.hits);
}, function(er) {
	console.error(er);
});

