var request=require('request');
var https = require('https');
var async = require('async');
var fs = require('fs');
var path = require('path');
var db = require('db');
var helper = require('./helper');
var RSVP = require('rsvp');

var instagram = require('instagram-node').instagram();
instagram.use({
    access_token: '519da9c304a147ddb12e0b58bf2a0598'
});
instagram.use({
    client_id: '9069a9b469824abea0d0cce7acb51fa8',
    client_secret: 'cb7a9f7cdb67498bbf0641b6d7489604'
});

global.config = require('config');

var AWS = require('aws-sdk');
var bucketName = 'if.kip.apparel.images';
var bucketUrlPrefex = 'https://s3.amazonaws.com/' + bucketName + '/';
var s3 = new AWS.S3({
    params: {
        Bucket: bucketName
    }
});


var redis = require('redis');
client = redis.createClient();


/**
 * number of days to go back into the past when scraping
 */
var days = 14;
var daysInMilliseconds = 1000 * 60 * 60 * 24 * days;

/**
 * Mapping of instagram users to their world id's
 */
db.Landmarks.find({'source_instagram_user.username': {$exists: true}}, function(err, landmarks) {
    landmarks.map(processStore);
});




/**
 * Process each instagram username that we have
 */
function processStore(store) {
    console.log('processing ' + store.source_instagram_user.username);
    var lastPostId;
    /**
     * get the most recent post id for this user
     */
    db.Landmarks.findOne({'parentID': store._id.toString()})
        .sort({'time.created': 'desc'})
        .exec()
        .then(function(post) {
            var query = {
                parentID: store._id.toString(),
                world: false
            };

            if (post) {
                lastPostId = post.source_instagram_post.id;
            }

            instagram.user_media_recent(store.source_instagram_user.id, handlePosts);

        });

    /**
     * handles the response from instagram
     */
    var handlePosts = function(err, medias, pagination, remaining, limit) {
        if (err) {
            return console.error(err);
        }

        debugger;

        var doneWithUser = false;
        medias.map(function(post) {
            if (!post.images || doneWithUser) {
                return;
            }

            // if we have it already, then we're done
            if (post.id === lastPostId) {
                console.log('all caught up for user ' + store.source_instagram_user.username);
                doneWithUser = true;
                return;
            } else if ((+new Date() - post.created_time*1000) > daysInMilliseconds) {
                console.log('hit maximum number of days for user ' + store.source_instagram_user.username);
                doneWithUser = true;
                return;
            }

            // otherwise save this exciting new instagram post to our database
            var filename = store.source_instagram_user.username + '/' + helper.getFileNameFromURL(post.images.standard_resolution.url);
            var landmark = new db.Landmarks({
                id: store.source_instagram_user.username + '_' + post.id,
                world: false,
                source_instagram_post: {
                    id: post.id,
                    created_time: post.created_time,
                    img_url: bucketUrlPrefex + filename,
                    original_url: post.images? post.images.standard_resolution.url : '',
                    text: post.caption? post.caption.text : '',
                    tags: post.tags
                },
                itemImageURL: [bucketUrlPrefex + filename],
                parent: {
                    mongoId: store._id.toString(),
                    name: store.name,
                    id: store.id
                },
                owner: {
                    mongoId: store._id.toString(),
                    name: store.name,
                    profileID: store.id
                },
                valid: true,
                description: post.caption? post.caption.text : store.name,
                loc: {
                    type: 'Point',
                    coordinates: store.loc.coordinates
                }
            });

            landmark.save(function(err) {
                if (err) { 
                    console.error(err);
                }
            });
            
            // also upload the image to S3
            https.get(landmark.source_instagram_post.original_url, function(stream) {
                s3.upload({
                    Bucket: bucketName,
                    Key: filename,
                    Body: stream,
                    ACL: 'public-read'
                }, function(err, data) {
                    if (err) {
                        console.error('Error uploading ' + landmark.source_instagram_post.original_url);
                        console.error(err);
                        return
                    }
                    console.log('Uploaded ' + landmark.source_instagram_post.img_url);

                    // Add it to the queue for image processing wizardry
                    client.rpush('snaps', landmark.toString());

                });
            });
        });

        if (!doneWithUser && pagination && pagination.next) {
            pagination.next(handlePosts)
        }
    }
};
