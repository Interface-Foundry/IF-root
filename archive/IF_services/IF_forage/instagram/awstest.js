
var AWS = require('aws-sdk');
var bucketName = 'if.kip.apparel.images';
var s3 = new AWS.S3({
    params: {
        Bucket: bucketName
    }
});

var https = require('https');
https.get('https://i1.sndcdn.com/artworks-000120574172-oiwolc-t120x120.jpg', function(stream) {
	s3.upload({
			Bucket: bucketName,
			Key: 'testing1234.jpg',
			Body: stream,
			ACL: 'public-read'
		}, function(err, data) {
			if (err) { console.log(err) }
			console.log(data);
		});
});

