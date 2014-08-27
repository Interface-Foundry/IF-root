
var express = require('express'), app = module.exports.app = express();
var request=require('request');
var logger = require('morgan');

app.use(logger('dev'));

var twitter = require('ntwitter'),
    mongoose = require('mongoose'),
    monguurl = require('monguurl');

var credentials = require('./credentials.js');
//var hashtag = require('../app/js/global_settings.js').hashtag;

var hashtag = ['#SFDemoDay'];



var Twit = require('twit');

var T = new Twit({
    consumer_key:    credentials.consumer_key
    , consumer_secret:     credentials.consumer_secret
    , access_token:        credentials.access_token_key
    , access_token_secret: credentials.access_token_secret
});

var twitterConnecionOn=true;

var stream = T.stream('statuses/filter', { track: '#apple', language: 'en' });
var tweet={};
stream.on('tweet', function (twt) {
    console.log("tweet");
    console.log(twt);
    tweet=twt;
    //TwitterTweets

});
/*stream.on('connected', function (response) {
 //...
 console.log("-------------");
 console.log("connected to twiiter");
 //console.log(response);
 });*/
stream.on('disconnect', function (disconnectMessage) {
    //...
    console.log("-------------");
    console.log("disconnecting from twitter");
    console.log(disconnectMessage);
    twitterConnecionFlag=false;
});



mongoose.connect('mongodb://localhost/if');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var TwitterTweets = require('./tweet_schema.js');
var TwitterModel = mongoose.model('TwitterTweets', TwitterTweets);
var ServerWidgets = require('./serverwidgets_schema.js');
console.log("!!!!!!!!!!!!!!!!!!!!!!");
console.log(TwitterTweets.methods);
//var tweetModel = mongoose.model('tweet', twitterSchema, 'tweets');  // compiling schema model into mongoose
var twitterFalseTags=[];

setInterval(function(){
    ServerWidgets.find({},function(err,docs){


        for (var i=0;i<docs.length;i++)
        {
            if(docs[i].twitter==true){

                if(hashtag.indexOf(docs[i].worldTag)==-1)
                {
                    if(hashtag.length<=400)
                    {
                        hashtag.push(docs[i].worldTag);
                    }
                }
            }
            else{
                fillTwiiterFalseArray(docs[i].worldTag);


            }
        }
        removeHashtags();

    });

//as it was not clear about reconnection so commenting this code.
    /*if(twitterConnecionOn){
     stream = T.stream('statuses/filter', { track: hashtag, language: 'en' });
     stream.on('reconnect', function (request, response, connectInterval) {
     //...
     });
     }
     else{

     }*/
//the logic for reconnecting or whatever startegy for capturing tweets will be set above
//stream = T.stream('statuses/filter', { track: hashtag, language: 'en' })


//saving tweets
    var user={};

    if(typeof tweet.user.name!='undefined')
    {
        user.name=tweet.user.name;
    }
    else{
        user.name="";
    }
    if(typeof tweet.user.screen_name!='undefined')
    {
        user.screen_name=tweet.user.screen_name;
    }
    else{
        user.screen_name="";
    }
    if(typeof tweet.user.id!='undefined')
    {
        user.userId=tweet.user.id;
    }
    else{
        user.userId="";
    }
    if(typeof tweet.user.id_str!='undefined')
    {
        user.userId_str=tweet.user.id_str;
    }
    else{
        user.userId_str="";
    }
    if(typeof tweet.user.profile_image_url!='undefined')
    {
        user.profile_image_url=tweet.user.profile_image_url;
    }
    else{
        user.profile_image_url="";
    }



    var small = new TwitterModel({ tweetID:tweet.id,tweetID_str:tweet.id_str,user:user,text:tweet.text,created:tweet.created_at });
    small.save(function (err) {
        if (err) return handleError(err);
        // saved!
    });




},20000);
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

