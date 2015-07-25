var spawn = require('child_process').spawn;
var db = require('db');
var fs = require('fs');
var Promise = require('bluebird');

var AWS = require('aws-sdk');
var bucketName = 'if.kip.apparel.images';
var bucketUrlPrefex = 'https://s3.amazonaws.com/' + bucketName + '/';
var s3 = new AWS.S3({
    params: {
        Bucket: bucketName
    }
});

//var cmd = "convert '$SRC' -resize 640X640\\> -size 640X640 xc:white +swap -gravity center -composite jpeg:- ";
var cmd = "convert";
var args = "$SRC -resize 640X640> -size 640X640 xc:white +swap -gravity center -composite jpeg:-";


db.Landmarks.findOne({
    world: false,
    'source_shoptiques_item.images': {$exists: true},
    loc: {
        $near: {
            $geometry: {
                type: "Point" ,
                coordinates: [ -73.990638 , 40.7352793 ]
                //coordinates: [ -77.0433437 , 38.9095334 ]
            },
            $maxDistance: 10000
        }
    }
}, function(err, item) {
    if (!item) {
        console.log('no item');
        process.exit(0);
    }

    item.source_shoptiques_item.images = item.source_shoptiques_item.images.map(function (u) {
        return u.replace('_m.jpg', '_l.jpg');
    });

    Promise.settle(item.source_shoptiques_item.images.map(function (u) {
        return new Promise(function(resolve, reject) {

            var key = item.parent.id + '/' + u.split('/').pop();
            var newUrl = bucketUrlPrefex + key;
            var a = args.replace('$SRC', u).split(' ');
            var s = spawn(cmd, a, {stdio: ['pipe', 'pipe', process.stderr]});

            s3.upload({
                Bucket: bucketName,
                Key: key,
                Body: s.stdout,
                ACL: 'public-read'
            }, function (err, data) {
                if (err || s.exitCode !== 0) {
                    console.error('Error uploading ' + newUrl);
                    console.error(err);
                    return reject(err);
                }

                console.log('Uploaded ' + newUrl);
                resolve(newUrl);
            });

            return newUrl;
        });
    })).then(function(results) {
        item.itemImageURL = results.map(function(r, i) {
            if (r.isFulfilled()) {
                return r.value();
            } else {
                return item.source_shoptiques_item.images[i];
            }
        });

        item.save(function (e) {
            if (e) {
                console.error(e);
                process.exit(1);
            }

            process.exit(0);
        });
    });

});
