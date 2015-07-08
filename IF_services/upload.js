'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    fs = require('fs'),
    q = require('q'),
    async = require('async'),
    AWS = require('aws-sdk')

module.exports = {
    //Upload pictures for looks
    uploadLook: function(profileID, base64) {
        var deferred = q.defer();
        var stuff_to_hash = profileID + (new Date().toString());
        var object_key = crypto.createHash('md5').update(stuff_to_hash).digest('hex');
        var fileType = base64.split(';')[0].split('/')[1];
        var date_in_path = (new Date().getUTCFullYear()) + "/" + (new Date().getUTCMonth()) + "/"
        var current = object_key + "." + fileType;
        var tempPath = "app/dist/temp_general_uploads/" + current;
        var awsKey = date_in_path + current;
        var writeStream = fs.createWriteStream(tempPath);
        fs.createReadStream(base64, {
            encoding: 'base64'
        }).pipe(writeStream);
        writeStream.on('close', function() {
                fs.readFile(tempPath, function(err, fileData) {
                    var s3 = new AWS.S3();
                    s3.putObject({
                        Bucket: 'if-server-general-images',
                        Key: awsKey,
                        Body: fileData,
                        ACL: 'public-read'
                    }, function(err, data) {
                        if (err)
                            console.log(err);
                        else {
                            fs.unlink(tempPath);
                            var imgURL = "https://s3.amazonaws.com/if-server-general-images/" + awsKey
                            deferred.resolve(imgURL)
                        } 
                    }); //s3
                }); //fs.readFile
            }) //writeStream.on
        return deferred.promise
    }
}