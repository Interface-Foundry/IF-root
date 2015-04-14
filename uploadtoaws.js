var fs = require('fs');
var AWS = require('aws-sdk');
var awsKey = 0;
var async = require('async');
var s3 = new AWS.S3();


var avatars = ['assets/user_icon1.png',
    'assets/user_icon2.png',
    'assets/user_icon3.png',
    'assets/user_icon4.png',
    'assets/user_icon5.png'
]



for (var i = 0; i <= 5; i++) {
var key = awsKey.toString();

fs.readFile(avatars[i], function(err, fileData) {
    s3.putObject({
        Bucket: 'if-server-avatars',
        Key: key,
        Body: fileData,
        ACL: 'public-read'
    }, function(err, data) {
        if (err) console.log(err)
        console.log(data)
        
        awsKey++
    })
})


}