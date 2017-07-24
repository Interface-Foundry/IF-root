var fs = require('fs')
var thunkify = require('thunkify')
var request = require('request-promise')
var stream = require('stream')
var uniqid = require('uniqid')
var path = require('path')

//update your README google ugh, make sure to include the () at the end of:
var gcs = require('@google-cloud/storage')()

const bucketName = 'kip-product-images'

// Reference an existing bucket.
var bucket = gcs.bucket(bucketName)


module.exports.processImages = async function (s){
	console.log('processImages')
	console.log(s.main_image_url)

	if(s.main_image_url){
		s.main_image_url = await storeImage(s.main_image_url)
		s.thumbnail_url = s.main_image_url
	}


	//WE'll eventually make a promise.all here for parallel running all images
	// var imageQ = []

	// for (i = 0; i < optionQ.length; i++) {
	// 	htmlQ.push(utils.scrapeURL(optionQ[i].opt_url))
	// }
	// var results = await Promise.all(htmlQ)

	// if(s.)

	return s

}


//pass an image url and it will download from the site, upload to google cloud and return the cloud image URL
var storeImage = async function (uri){

	var imgURL
	var fileType = path.extname(uri).substring(1)
	var MIMEType
	//get MIME type
	switch(fileType){
		case 'jpg':
		case 'jpeg':
			MIMEType = 'image/jpeg' //can someone explain why it's the same MIME type wtf
		break
		case 'png':
			MIMEType = 'image/png'
		break
		case 'gif':
			MIMEType = 'image/gif'
		break
	}

	if(fileType !== 'jpg' && fileType !== 'png' && fileType !== 'jpeg' && fileType !== 'gif'){
		logging.error('NOT CORRECT FILE TYPE')
		return uri //keep the path as is
	}

	console.log('FILE TYPE ',fileType)
	console.log('MIME ',MIMEType)

	//unique name for this image
	const fileId = uniqid()

	var options = {
	    uri: uri,
	    encoding: null
	}
	await request(options,
		function(error, response, body) {
	    if (error || response.statusCode !== 200) {
	        logging.error("failed to get image ",error);
	    } else {

	    	console.log('#1')
	    	//pass buffer into new file on gcloud
			var bufferStream = new stream.PassThrough();
			bufferStream.end(new Buffer(body));

			//new bucket file
			var file = bucket.file(fileId+'.'+fileType);

			console.log('#2')
			//pipe bufferStream into file.createWriteStream

			imgURL = new Promise((resolve, reject) => {
				bufferStream.pipe(file.createWriteStream({
				    metadata: {
				      contentType: MIMEType,
				      metadata: {
				        custom: 'metadata'
				      }
				    },
				    public: true,
				    validation: "md5"
				  }))
				  .on('error', function(err) {
				  	logging.error('stream to google cloud storage failed')
						reject()
				  })
				  .on('finish', function() {
				  	console.log('#3')
				    resolve('https://storage.googleapis.com/'+bucketName+'/'+fileId+'.'+fileType)
				});
			})
	    }
	})

	await imgURL;
	console.log('#4')

	//just return the original if we failed at uploading an image
	if(!imgURL){
		console.log('NOPE')
		imgURL = uri
	}

	console.log('RETURNING ',imgURL)
	return imgURL
}
