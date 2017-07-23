var fs = require('fs')
var request = require('request-promise')
var stream = require('stream')
var uniqid = require('uniqid')
var path = require('path')

//update your README google ugh, make sure to include the () at the end of:
var gcs = require('@google-cloud/storage')() 

const bucketName = 'kip-product-images'

// Reference an existing bucket. 
var bucket = gcs.bucket(bucketName)
 



var uri = 'http://image.lotte.com/goods/51/22/75/62/3/362752251_1_550.jpg'

var fileType = path.extname(uri).substring(1)

console.log('fileType ',fileType)

if(fileType !== 'jpg'){
	console.log('NOT CORRECT FILE TYPE')
	return uri //keep the path as is
}

//unique name for this image
const fileId = uniqid()

//download image 
//
//generate image ID
//
var options = {
    uri: uri,
    encoding: null
}

request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) { 
        console.log("failed to get image");
        console.log(error);
    } else {

		var bufferStream = new stream.PassThrough();
		bufferStream.end(new Buffer(body));

		//new bucket file
		var file = bucket.file(fileId+'.jpg');

		//pipe bufferStream into file.createWriteStream 
		bufferStream.pipe(file.createWriteStream({
		    metadata: {
		      contentType: 'image/jpeg',
		      metadata: {
		        custom: 'metadata'
		      }
		    },
		    public: true,
		    validation: "md5"
		  }))
		  .on('error', function(err) {
		  	console.log('stream to google cloud storage failed')
		  })
		  .on('finish', function() {
		    // The file upload is complete.
		    console.log('https://storage.googleapis.com/'+bucketName+'/'+fileId+'.png')

		});
    }   
});





