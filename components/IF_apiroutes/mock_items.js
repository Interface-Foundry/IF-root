
module.exports.exampleInstagramPost = {
  id: 'abcd',
  created_time: 1435014076,
  img_url: 'https://placekitten.com/600/600',
  original_url: 'https://placekitten.com/600/600'
};

module.exports.example = {
  _id: '558b2ad7a0d6b1f2c542107f',
  id: 'item1234',
  parentID: '5589e68d1938dac55f0eb7a7',
  valid: true,
  status: 'public',
  hasLoc: true,
  loc: {
    type: 'Point',
    coordinates: {lat: 40.7240168, lon: -74.0009368}
  },
  itemTags: {
    color: ["000000", "FFFFFF"],
    categories: ["category1", "category2"],
    text: ['tag1', 'tag2', 'reallyreallylongtag3']
  },
  price: 2,
  faves: [{
    userId: 'userid',
    timeFaved: new Date("2015-6-11T02:45:34.812Z")
  }],
  fave_count: 1,
  ownerUserName: 'Princess Peach',
  ownerUserId: 'peach',
  ownerMongoId: '55799f4a76256a9342b03bad',
  itemImageURL: ['https://placekitten.com/600/600', 'https://placekitten.com/600/600'],
  comments: [{
    userId: 'peach',
    userName: 'Princess Peach',
    userAvatar: 'https://s3.amazonaws.com/if-server-avatars/2',
    userMongoId: '55799f4a76256a9342b03bad',
    comment: 'Comment text',
    timeCommented: new Date("2015-6-11T02:46:34.812Z")
  }]
};

module.exports.getResultsArray = function(num) {
  var r = [];
  for (var i = 0; i < num; i++) {
    r.push(module.exports.example);
  }
  return r;
};