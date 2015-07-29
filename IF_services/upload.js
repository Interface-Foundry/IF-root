'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    q = require('q'),
    async = require('async'),
    AWS = require('aws-sdk'),
    crypto = require('crypto')

module.exports = {
    //Upload pictures to Amazon S3 for snaps and looks
    uploadPicture: function(profileID, base64) {
        var deferred = q.defer();
        var buffer = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        var stuff_to_hash = profileID + (new Date().toString());
        var object_key = crypto.createHash('md5').update(stuff_to_hash).digest('hex');
        var fileType = base64.split(';')[0].split('/')[1];
        // var date_in_path = (new Date().getUTCFullYear()) + "/" + (new Date().getUTCMonth()) + "/"
        var current = object_key + "." + fileType;
        var awsKey = 
        // date_in_path + 
        current;
        var s3 = new AWS.S3();
        s3.putObject({
            Bucket: 'if-server-general-images',
            Key: awsKey,
            Body: buffer,
            ACL: 'public-read'
        }, function(err, data) {
            if (err) deferred.reject(err)
            else {
                var imgURL = "https://s3.amazonaws.com/if-server-general-images/" + awsKey
                deferred.resolve(imgURL)
            }
        });
        return deferred.promise
    }
}