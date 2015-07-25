var spawn = require('child_process').spawn;
var db = require('db');
var fs = require('fs');

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
    itemImageURL: /shoptiques.net/,
    loc: {
        $near: {
            $geometry: {
                type: "Point" ,
                //coordinates: [ -73.990638 , 40.7352793 ]
                coordinates: [ -77.0433437 , 38.9095334 ]
            },
            $maxDistance: 10000
        }
    }
}, function(err, item) {
    if (!item) {
        console.log('no item');
        process.exit(0);
    }

    var tasks = 2;

    item.source_shoptiques_item.images = item.source_shoptiques_item.images.map(function (u) {
        return u.replace('_m.jpg', '_l.jpg');
    });

    item.itemImageURL = item.source_shoptiques_item.images.map(function (u) {

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
            tasks--;
            if (err) {
                console.error('Error uploading ' + newUrl);
                console.error(err);
                process.exit(1);
            }

            console.log('Uploaded ' + newUrl);
            if (tasks === 0) {
                process.exit(0);
            }
        });

        return newUrl;
    });

    item.save(function (e) {
        tasks--;
        if (e) {
            console.error(e);
            process.exit(1);
        }
        if (tasks === 0) {
            process.exit(0);
        }
    });
});
