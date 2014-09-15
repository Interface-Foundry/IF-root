
var express = require('express'), app = module.exports.app = express();
var request=require('request');
var logger = require('morgan');
var async = require('async');

app.use(logger('dev'));

var mongoose = require('mongoose'),
    monguurl = require('monguurl');



var strings = require('./constants/strings');
var integers = require('./constants/integers');
var helper = require('./constants/helper');

var instagramNode = require('instagram-node');
var instagram = instagramNode.instagram();

helper.applyCredentials(instagram);


mongoose.connect('mongodb://localhost/if');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var ServerWidgets = require('./serverwidgets_schema.js');

var hashtag = []; //live tags?
var liveTags = []; //searched tags
var twitterTags = []; //tags to search
var twitterRemovals = []; //tags to remove from search
var twitterFalseTags=[]; //via tahir




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




// setInterval(function() {

//   instagram.tag_media_recent(strings.TAG_FOR_IMAGES, processTagMediaRecent);

// }, 3000);



//updates active tag array
setInterval(function(){

    ServerWidgets.find({},function(err,docs){

        hashtag = []; //clear array before 

        async.each(docs, function( doc, callback) {

            if(doc.instagram==true){

                if(hashtag.indexOf(doc.worldTag)==-1)
                {
                    hashtag.push(doc.worldTag);   
                }
            }
            else{
                fillTwitterFalseArray(doc.worldTag);
            }

        }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
              // One of the iterations produced an error.
              // All processing will now stop.
              console.log('A file failed to process');
            } else {
              console.log('All files have been processed successfully');

                removeHashtags();
            }
        });

    });

},10000);

//loops through active tag array to search instagram
async.whilst(
    function () { return true }, 
    function (callback) {
        console.log(hashtag);

        async.eachSeries(hashtag, function(tag, callback) {
            searchInstagram(tag, function() {
                setTimeout(callback, 3000); // Wait before going on to the next tag
            })
        }, function(err) {
            setTimeout(callback, 3000); // Wait before looping over the hashtags again
        });
    },
    function (err) {
    }
);

//searches instagram
function searchInstagram(tag, done) {

    instagram.tag_media_recent(tag, processTagMediaRecent);

    done();

    // T.get('search/tweets', { q: '#'+tag, count: 50 }, function(err, data, response) {

    //     if (err){
    //         console.log(err);
    //     }
    //     else {
    //         async.each(data.statuses, function( tweet, callback) {
    //           saveTweet(tweet);
    //         }, function(err){
    //             console.log(err);    
    //         });                
    //     }
    //     done(); 
    // });
}




//a function which tracks the tag that occur only once in in the db and has twiiter value true
function fillTwitterFalseArray(worldTag){
    var found=false;
    var index=-1;
    for(var i=0;i<twitterFalseTags.length;i++)
    {
        var obj=twitterFalseTags[i];
        if(obj.worldTag==worldTag)
        {
            found=true;
            index=i;
        }
    }
    if(!found){
        twitterFalseTags.push({worldTag:worldTag,count:1});
    }
    else{
        twitterFalseTags[index]["count"]=twitterFalseTags[index]["count"]++;
    }

}
//this function removes the hashtags from active hashtag array 
function removeHashtags(){

    console.log('asdf');
    for(var i=0;i<twitterFalseTags.length;i++)
    {
        if(twitterFalseTags[i].count>1){
            var index=hashtag.indexOf(twitterFalseTags[i].worldTag)
            hashtag.splice(index,1);
        }
    }
    twitterFalseTags=[];
    //console.log('asdfasdf'+hashtag);
    //liveTags = hashtag.splice();
}

app.listen(3130, function() {
    console.log("3130 ~ ~");
});

