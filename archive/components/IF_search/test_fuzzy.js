var elasticsearch = require('elasticsearch');

var es = new elasticsearch.Client({
	host: 'localhost:9200'
});

es.search({
	index: 'test',
	type: 'posts',
	query: {
		match: {
			title: {
				query: "spicey",
				fuzziness: 2,
				prefix_length: 1
			}
		}
	}
}).then(function(res) {
	console.log(res.hits.hits);
}, function(err) {
	console.error(err);
});
