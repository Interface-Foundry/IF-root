/*
Time Range queries
*/

var configDB = require('./components/IF_auth/database.js');

//----MONGOOOSE & SCHEMAS----//
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose'),
    landmarkSchema = require('./components/IF_schemas/landmark_schema.js');
    monguurl = require('monguurl');


mongoose.connect(configDB.url); 

var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//




function objectIdWithTimestamp(timestamp)
{
    // Convert string date to Date object (otherwise assume timestamp is a date)
    if (typeof(timestamp) == 'string') {
        timestamp = new Date(timestamp);
    }

    // Convert date object to hex seconds since Unix epoch
    var hexSeconds = Math.floor(timestamp/1000).toString(16);

    // Create an ObjectId with that hex timestamp
    var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");

    return constructedObjectId
}


// items.find({
//     created_at: {
//         $gte: ISODate("2010-04-29T00:00:00.000Z"),
//         $lt: ISODate("2010-05-01T00:00:00.000Z")
//     }
// })
var qw = {
    '_id': {
        $gte: objectIdWithTimestamp('2014/09/01'),
        $lt: objectIdWithTimestamp('2014/10/02')
    }
};   

landmarkSchema.find(qw,function(err, data) {

  console.log(data.length);
});

//landmarkSchema.find({ _id: { $gt: objectIdWithTimestamp('1980/05/25') } });
