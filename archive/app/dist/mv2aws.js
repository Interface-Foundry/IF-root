var fs = require('fs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var folders = [
	{dir: 'uploads', bucket: 'if-server-general-images'},
	{dir: 'pictures', bucket: 'if-server-general-images'},
	{dir: 'temp_avatar_uploads', bucket: 'if-server-avatar-images'}
];

folders.map(function() {

});

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
