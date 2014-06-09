var mongoose = require('mongoose');

var strings = require('./constants/strings');
var integers = require('./constants/integers');
var helper = require('./constants/helper');

var instagramNode = require('instagram-node');
var instagram = instagramNode.instagram();

mongoose.connect(strings.DEFAULT_DB_URL);
helper.applyCredentials(instagram);

var processTagMediaRecent = function(err, data, limit) {

  console.log('Downloading new images');

  if(err) {
    console.log(err);
    return;
  }

  for(var i = 0; i < data.length; i++) {
    helper.downloadImageObject(data[i]);
  }

  return;
}

setInterval(function() {
  instagram.tag_media_recent(strings.TAG_FOR_IMAGES,
  processTagMediaRecent);
}, integers.INSTAGRAM_DATA_PULL_INTERVAL);
