
var express = require('express'), app = module.exports.app = express();
var request=require('request');
var logger = require('morgan');

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

var twitterConnecionOn=true;

// var stream = T.stream('statuses/filter', { track: '#apple', language: 'en' });
// var tweet={};
// stream.on('tweet', function (twt) {
//     console.log("tweet");
//     console.log(twt);
//     tweet=twt;
//     //TwitterTweets

// });

// stream.on('disconnect', function (disconnectMessage) {
//     //...
//     console.log("-------------");
//     console.log("disconnecting from twitter");
//     console.log(disconnectMessage);
//     twitterConnecionFlag=false;
// });

mongoose.connect('mongodb://localhost/if');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var TwitterTweets = require('./tweet_schema.js');
var TwitterModel = mongoose.model('TwitterTweets', TwitterTweets);
var ServerWidgets = require('./serverwidgets_schema.js');

//var twitterFalseTags = [];

var twitterTags = [];

setInterval(function(){

    ServerWidgets.find({},function(err,docs){

        for (var i=0; i < docs.length; i++){

            if(docs[i].twitter == true){ //tag turned on

                if(docs[i].worldTag){ //tag is present and greater than or equal to 3 characters

                    if (docs[i].worldTag.length >= 3){ //only hashtag greater than 3

                       twitterTags.push(docs[i].worldTag);

                    }
                    else {
                        console.log('hashtag must be at least 3 characters');
                    }
                }
                else {
                    console.log('no hashtag');
                }
            }
            else { //tag turned off, check for tag in array
                fillTwiiterFalseArray(docs[i].worldTag);
                //check for tag in array and if 
            }

        }
        //removeHashtags();

    });

    //console.log(twitterFalseTags);





// //saving tweets
//     var user={};

//     if(typeof tweet.user.name!='undefined')
//     {
//         user.name=tweet.user.name;
//     }
//     else{
//         user.name="";
//     }
//     if(typeof tweet.user.screen_name!='undefined')
//     {
//         user.screen_name=tweet.user.screen_name;
//     }
//     else{
//         user.screen_name="";
//     }
//     if(typeof tweet.user.id!='undefined')
//     {
//         user.userId=tweet.user.id;
//     }
//     else{
//         user.userId="";
//     }
//     if(typeof tweet.user.id_str!='undefined')
//     {
//         user.userId_str=tweet.user.id_str;
//     }
//     else{
//         user.userId_str="";
//     }
//     if(typeof tweet.user.profile_image_url!='undefined')
//     {
//         user.profile_image_url=tweet.user.profile_image_url;
//     }
//     else{
//         user.profile_image_url="";
//     }



//     var small = new TwitterModel({ tweetID:tweet.id,tweetID_str:tweet.id_str,user:user,text:tweet.text,created:tweet.created_at });
//     small.save(function (err) {
//         if (err) return handleError(err);
//         // saved!
//     });

    setInterval(function(){

        searchTwitter();
        console.log(twitterTags);

    },20000);


},10000);



while(0){
    T.get('search/tweets', { q: '#fun', count: 100 }, function(err, data, response) {
        console.log(data);
        console.log(err);
        console.log(response);
    });  
    sleep 

}






function searchTwitter(){


    T.get('search/tweets', { q: '#fun', count: 100 }, function(err, data, response) {
        console.log(data)
    });

    //upsert
}

//a function which tracks the tag that occur only once in in the db and has twiiter value true
function fillTwiiterFalseArray(worldTag){
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
    if(!found)
    {
        twitterFalseTags.push({worldTag:worldTag,count:1});
    }
    else{
        twitterFalseTags[index]["count"]=twitterFalseTags[index]["count"]++;
    }

}
//this function removes the hashtags from active hashtag array 
function removeHashtags(){

    for(var i=0;i<twitterFalseTags.length;i++)
    {
        if(twitterFalseTags[i].count>1){
            var index=hashtag.indexOf(twitterFalseTags[i].worldTag)
            hashtag.splice(index,1);
        }
    }
    twitterFalseTags=[];
}
app.listen(3131, function() {
    console.log("3131 ~ ~");
});

