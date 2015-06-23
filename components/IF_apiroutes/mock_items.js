
module.exports.exampleInstagramPost = {
  id: 'abcd',
  created_time: 1435014076,
  img_url: 'https://placekitten.com/600/600',
  original_url: 'https://placekitten.com/600/600'
};

module.exports.example = {
  _id: '1234',
  id: 'item1234',
  parentID: '',
  valid: true,
  status: 'public',
  hasLoc: true,
  loc: {
    type: 'Point',
    coordinates: {lat: 40.7240168, lon: -74.0009368} // in SoHo
  },
  itemTags: {
    color: ["000000", "FFFFFF"],
    categories: ["category1", "category2"],
    text: ['tag1', 'tag2', 'reallyreallylongtag3']
  },
  price: 2,
  likes: [{
    userId: 'userid',
    timeLiked: new Date(1435014076000)
  }],
  like_count: 10000,
  ownerUserName: 'OwnerUserName',
  ownerUserId: 'owneruserid',
  ownerMongoId: '',
  itemImageURL: ['https://placekitten.com/600/600', 'https://placekitten.com/600/600']

};

module.exports.getResultsArray = function(num) {
  var r = [];
  for (var i = 0; i < num; i++) {
    r.push(module.exports.example);
  }
  return r;
};