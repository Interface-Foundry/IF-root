var https = require('https');
var fs = require('fs');
var url = require('url');
var im = require('imagemagick'); //must also install imagemagick package on server /!\

var readChunk = require('read-chunk');
var fileTypeProcess = require('file-type');

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var awsBucket = "if.instagram.images";

var lists = require('./lists');
var strings = require('./strings');
var credentials = require('./credentials');

var instagramModel = require('../models/instagram');

var isNull = function(value) {
    return (value == null);
}

var convertToInteger = function(value) {
    return parseInt(value);
}

var convertUnixTimestampToDate = function(epoch) {
    var epochInt = convertToInteger(epoch) * 1000;
    return new Date(epochInt);
}

var getFileNameFromURL = function(imageURL) {
    return url.parse(imageURL).pathname.split('/').pop();
}

var downloadImage = function(imageURL) {
    var fileName = getFileNameFromURL(imageURL);
    var writeStreamDestinaton = strings.IMAGE_SAVE_DESTINATION + fileName;

    if (fs.existsSync(writeStreamDestinaton)) {
        return;
    } else {
        var file = fs.createWriteStream(writeStreamDestinaton);
        var request = https.get(imageURL, function onImageDownload(response) {
                response.on('data', function(data) {
                    file.write(data);
                });
                response.on('end', function(data) {

                    var buffer = readChunk.sync(writeStreamDestinaton, 0, 262);

                    if (fileTypeProcess(buffer) == false) {
                        console.log('bad file!');
                        fs.unlink(writeStreamDestinaton); //Need to add an alert if there are several attempts to upload bad files here
                    } else {

                        //Resize image
                        im.resize({
                            srcData: writeStreamDestinaton,
                            dstPath: writeStreamDestinaton,
                            width: 600,
                            height: 600,
                            quality: 0.8
                        }, function(err, stdout, stderr) {
                            var s3bucket = new AWS.S3({
                                params: {
                                    Bucket: awsBucket
                                }
                            });
                            fs.readFile(writeStreamDestinaton, function(err, fileData) {
                                //Check if file already exists
                                var params = {
                                    Bucket: awsBucket,
                                    Key: fileName
                                };
                                s3.headObject(params, function(err, metadata) {
                                    if (err && err.code == 'NotFound') {
                                       console.log('Not found! Saving!')
                                        s3.putObject({
                                            Bucket: awsBucket,
                                            Key: fileName,
                                            Body: fileData,
                                            ACL: 'public-read'
                                        }, function(err, data) {
                                            if (err) console.log(err);
                                            console.log('saved!')
                                        }); //END OF s3.putObject 
                                    } 
                                    else {
                                        console.log('File already exists!')
                                    }
                                });
                            })
                        }); //END OF IM.RESIZE
                        file.end(function(err) {

                        });
                    }
                }); //END OF RESPONSE ON END
                response.on('error', function(err) {
                    //console.log('333333');
                    console.log("ERROR:" + err);
                    file.read();

                }); //END OF RESPONSE.ON

            }) //END OF REQUEST
    }
    return
}






var getImagesToBeSaved = function(imageObjectImages) {
    var imageObjectImagesList = [];
    for (var image in imageObjectImages) {
        if (lists.IMAGES_TO_DOWNLOAD.indexOf(image) > -1) {
            var imageURL = imageObjectImages[image][strings.IMAGE_OBJECT_KEY_URL];
            var imageFileName = getFileNameFromURL(imageURL);
            imageObjectImagesList.push({
                'url': imageURL,
                'fileName': imageFileName
            });
        }
    }
    return imageObjectImagesList;
}

var saveImage = function(imageObject) {

    // console.log(JSON.stringify(imageObject));
    // console.log('\n\n\n\n');

    var userObject = imageObject[strings.IMAGE_OBJECT_KEY_USER];
    var captionObject = imageObject[strings.IMAGE_OBJECT_KEY_CAPTION];
    var captionText = '';
    if (!isNull(captionObject))
        captionText = captionObject[strings.IMAGE_OBJECT_KEY_CAPTION_TEXT];

    var images = imageObject[strings.INSTAGRAM_IMAGE_FIELD];
    var imageObjectLocalPaths = [];
    var imagesToBeSaved = getImagesToBeSaved(images);

    for (var i = 0; i < imagesToBeSaved.length; i++)
        imageObjectLocalPaths.push(imagesToBeSaved[i]['fileName']);

    var createdTime = imageObject[strings.IMAGE_OBJECT_KEY_CREATED_TIME];
    createdTime = convertUnixTimestampToDate(createdTime);

    var objectIDForDB = imageObject[strings.IMAGE_OBJECT_KEY_ID]

    var newInstagramImage = instagramModel({
        objectID: objectIDForDB,
        user: {
            name: userObject[strings.IMAGE_OBJECT_KEY_USER_NAME],
            screen_name: userObject[strings.IMAGE_OBJECT_KEY_USER_SCREEN_NAME],
            userId: userObject[strings.IMAGE_OBJECT_KEY_USER_ID],
            userId_str: userObject[strings.IMAGE_OBJECT_KEY_USER_ID],
            profile_image_url: userObject[strings.IMAGE_OBJECT_KEY_USER_PROFILE_IMAGE_URL]
        },
        img_url: images[strings.INSTAGRAM_IMAGE_RESOLUTION_LOW],
        original_url: images[strings.INSTAGRAM_IMAGE_RESOLUTION_STANDARD],
        local_path:  imageObjectLocalPaths, //aws link to image e.g. aws.bucketname.id
        text: captionText,
        tags: imageObject[strings.IMAGE_OBJECT_KEY_TAGS],
        created: new Date()
    });

    instagramModel.find({
            objectID: objectIDForDB
        },
        function(err, instagrams) {
            if (err) {
                console.log(err);
                return;
            }

            //console.log("Instgrams following;");
            //console.log(instagrams);

            if (instagrams.length > 0) {
                //console.log("Will return without saving");
                return;
            }

            newInstagramImage.save(function(err) {
                if (err) {
                    //console.log('An error occured while saving image');
                    console.log(err);
                } else {
                    //console.log('Image saved successfully');
                }
            });
            return;
        });
}

var downloadWithImageList = function(listImageURL) {
    for (var i = 0; i < listImageURL.length; i++)
        downloadImage(listImageURL[i]['url']);
}

exports.applyCredentials = function(instagramObject) {
    var listOfCredentialObjects = credentials.CREDENTIAL_LIST;
    for (var i = 0; i < listOfCredentialObjects.length; i++)
        instagramObject.use(listOfCredentialObjects[i]);
}

exports.downloadImageObject = function(imageObject) {

    // Download the predefined images from image object
    var imageObjectImages = imageObject[strings.INSTAGRAM_IMAGE_FIELD];
    var imagesToDownload = getImagesToBeSaved(imageObjectImages);
    downloadWithImageList(imagesToDownload);

    // Save the object to db
    saveImage(imageObject);
    return;
}