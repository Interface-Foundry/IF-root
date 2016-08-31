
var amazon = require('amazon-product-api');
var fs = require('fs');
var async = require('async');
var co = require('co');
var async = require('async');

var client = amazon.createClient({
	awsId: "AKIAIKMXJTAV2ORZMWMQ",
	awsSecret: "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",
	awsTag: "quic0b-20"
});

function sendRequest(asins, index, responses) {
	if (asins[index]) {
		client.itemLookup({
			idType: 'ASIN',
			itemId: asins.slice(index, index + 10).join(','),
			responseGroup: 'ItemAttributes, BrowseNodes'
		}, function(err, results, response) {
			if (err) {
				setTimeout(function () { sendRequest(asins, index, responses) }, 1000);
			} else {
				responses.push(results)
				// fs.writeFile("responses.txt", results, function(err) {
				// 	if(err) {
				// 		return console.log(err);
				// 	}
				// 	console.log("The file was saved!");
				// }); 
				// console.log(index);
			}
		});
		setTimeout(function () { sendRequest(asins, ++index, responses) }, 1100);	
	}
}



var asins = []
fs.readFile('test_asins.txt', 'utf8', function(err, data) {  
    if (err) throw err;
    console.log(asins)
    asins = data.split('\n');
    var responses = [];
    setTimeout(function () { sendRequest(asins, 0, responses) }, 1000)

	// async.forEach(asins, function (elem, callback) {
	// 	setTimeout(function () { 
	// 		client.itemLookup({
	// 			idType: 'ASIN',
	// 			itemId: elem,
	// 			responseGroup: 'ItemAttributes, BrowseNodes'
	// 		}, function(err, results, response) {
	// 			if (err) {
	// 				console.log(err);
	// 			} else {
	// 				responses.push(results)
	// 				console.log(JSON.stringify(results[0], null, 2));
	// 			}
	// 		});
	// 	}, 1000);
	// });
	
});

fs.writeFile("responses.txt", responses, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

