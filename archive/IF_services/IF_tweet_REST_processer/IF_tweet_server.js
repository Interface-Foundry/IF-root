
var express = require('express'), app = module.exports.app = express();
var request=require('request');
var logger = require('morgan');
var async = require('async');

app.use(logger('dev'));

var mongoose = require('mongoose'),
    monguurl = require('monguurl');

var credentials = require('./credentials.js');

var Twit = require('twit');

var T = new Twit({
    consumer_key:    credentials.consumer_key
    , consumer_secret:     credentials.consumer_secret
    , access_token:        credentials.access_token_key
    , access_token_secret: credentials.access_token_secret
});

global.config = require('../../config');

mongoose.connect(global.config.mongodb.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var twitterSchema = require('./tweet_schema.js');
var tweetModel = mongoose.model('tweet', twitterSchema, 'tweets');  // compiling schema model into mongoose

var ServerWidgets = require('./serverwidgets_schema.js');

var hashtag = []; //live tags?
var liveTags = []; //searched tags
var twitterTags = []; //tags to search
var twitterRemovals = []; //tags to remove from search
var twitterFalseTags=[]; //via tahir

//updates active tag array
setInterval(function(){

    ServerWidgets.find({},function(err,docs){

        hashtag = []; //clear array before 

        async.each(docs, function( doc, callback) {

            if(doc.twitter==true){

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
              //console.log('A file failed to process');
            } else {
              //console.log('All files have been processed successfully');

                removeHashtags();
            }
        });

    });

},10000);

//loops through active tag array to search twitter
async.whilst(
    function () { return true }, 
    function (callback) {
        // console.log(hashtag);

        async.eachSeries(hashtag, function(tag, callback) {
            searchTwitter(tag, function() {
                setTimeout(callback, 5000); // Wait before going on to the next tag
            })
        }, function(err) {
            setTimeout(callback, 5000); // Wait before looping over the hashtags again
        });
    },
    function (err) {
    }
);

//searches twitter
function searchTwitter(tag, done) {

    T.get('search/tweets', { q: '#'+tag, count: 50 }, function(err, data, response) {

        if (err){
            //console.log(err);
        }
        else {
            async.each(data.statuses, function( tweet, callback) {
              saveTweet(tweet);
            }, function(err){
                //console.log(err);    
            });                
        }
        done(); 
    });
}

//saves tweets
function saveTweet(tweet){
    
    var lm = new tweetModel();

    var mediaType;
    var mediaURL;

    if (tweet.entities.media){
        mediaType = "image";
        mediaURL = tweet.entities.media[0].media_url;
    }

    else if (tweet.entities.urls[0]) {

            if (tweet.entities.urls[0].expanded_url.indexOf('instagram.com') > -1){
                mediaType = "instagram";
            }
            if (tweet.entities.urls[0].expanded_url.indexOf('vine.co') > -1){
                mediaType = "vine";
            }
            if (tweet.entities.urls[0].expanded_url.indexOf('media.tumblr.com') > -1){
                mediaType = "tumblr";
            }
            if (tweet.entities.urls[0].expanded_url.indexOf('youtube.com') > -1 || tweet.entities.urls[0].expanded_url.indexOf('youtu.be') > -1){
                mediaType = "youtube";
            }

            mediaURL = tweet.entities.urls[0].expanded_url;
    }
    if (tweet.id){
      lm.tweetID = tweet.id;  
    }

    if (tweet.id_str){
      lm.tweetID_str = tweet.id_str;
    }
    
    if (mediaType && mediaURL){
        lm.media.media_type = mediaType;
        lm.media.media_url = mediaURL;
    }

    if (tweet.user){

        if (tweet.user.name){
            lm.user.name = tweet.user.name;     
        }

        if (tweet.user.screen_name){
            lm.user.screen_name = tweet.user.screen_name;     
        }

        if (tweet.user.userID){
            lm.user.userID = tweet.user.userID;     
        }

        if (tweet.user.userID_str){
            lm.user.userID_str = tweet.user.userID_str;     
        }

        if (tweet.user.profile_image_url){
            lm.user.profile_image_url = tweet.user.profile_image_url;         
        }

    }
    
    if (tweet.text){
        lm.text = tweet.text;     
    }

    if (tweet.entities){
        if (tweet.entities.hashtags){
            for (var i=0;i<tweet.entities.hashtags.length;i++){ 
                 lm.hashtags.push(tweet.entities.hashtags[i].text);
            }          
        }
    }
  
    lm.save(function (err, landmark) {
        // if (err) 
        //     //console.log(err);
        // else
        //     console.log(".");
    });
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

   // console.log('asdf');
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

app.listen(3131, function() {
    console.log("3131 ~ ~");
});

