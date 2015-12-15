var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var feedDataSchema = mongoose.Schema({
    file_path: String,
    local_path: String,
    captions: [String],
    source: String,
    imgSrc: String,
    type: String,
    data: {} // free-form data
});

module.exports = mongoose.model('feedData', feedDataSchema);

// {
//     captions: ['Adidas Basketball Shoes Black/Blue/White Mens US Size 11D (Medium) Used Leather Men\'s Athletic'],
//     file_path: '/home/ubuntu/images/train/301806837351_Thu_Dec_03_2015_16_12_58_GMT-0500_EST.png',
//     source: 'ebay',
//     type: 'trainx',
//     imgSrc: 'http://i.ebayimg.com/00/s/MTYwMFgxMjAw/z/9pMAAOSwT4lWRjn8/$_1.JPG?set_id=880000500F'
// }