var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
	host: 'localhost:9200'
});

es.count({
	index: "if",
	type: "landmarks"
}, function(err, res) {
	if (err) {
		console.error(err);
		console.log("Installation of river must have failed :C");
	} else if (res.count > 0) {
		console.log("Success");
	} else {
		console.log("no documents found, iver must have failed :C");
	}
});
