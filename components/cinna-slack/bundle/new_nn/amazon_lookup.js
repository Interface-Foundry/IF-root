
amazon = require('amazon-product-api');


var client = amazon.createClient({
	awsId: "AKIAIKMXJTAV2ORZMWMQ",
	awsSecret: "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",
	awsTag: "quic0b-20"
});

client.itemLookup({
	idType: 'ASIN',
	itemId: 'B01B5KAAAS',
	responseGroup: 'ItemAttributes, BrowseNodes'
}, function(err, results, response) {
	if (err) {
		console.log(err);
	} else {
		console.log(JSON.stringify(results[0], null, 2));
	}
});