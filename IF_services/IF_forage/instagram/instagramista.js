var request=require('request');
var logger = require('morgan');
var async = require('async');
var fs = require('fs');
var path = require('path');

app.use(logger('dev'));

var mongoose = require('mongoose'),
    monguurl = require('monguurl');

var helper = require('./constants/helper');

var instagramNode = require('instagram-node');
var instagram = instagramNode.instagram();

helper.applyCredentials(instagram);


global.config = require('config');

mongoose.connect(global.config.mongodb.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


/**
 * list of user/bubble id pairs
 */
var instagramUsers = {
    "wildstylela": "",
    "kklostermanjewelry": "",
    "raleighvintage": "",
    "whendecadescollide": ""
}

var ServerWidgets = require('./serverwidgets_schema.js');

var hashtag = []; //live tags?
var liveTags = []; //searched tags
var twitterTags = []; //tags to search
var twitterRemovals = []; //tags to remove from search
var twitterFalseTags=[]; //via tahir

// make sure the tempimages directory exists
// console.log(strings.IMAGE_SAVE_DESTINATION);
if (!fs.existsSync(strings.IMAGE_SAVE_DESTINATION)) {
	fs.mkdirSync(strings.IMAGE_SAVE_DESTINATION);
}

var processTagMediaRecent = function(err, data, limit) {

  //console.log('Downloading new images');

  if(err) {
    //console.log(err);
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
              //console.log('A file failed to process');
            } else {
              //console.log('All files have been processed successfully');

                removeHashtags();
            }
        });

    });

},10000);

//loops through active tag array to search instagram
async.whilst(
    function () { return true }, 
    function (callback) {
        // console.log(hashtag);

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

    //console.log('asdf');
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




//Routinely checks size of image directory and removes images older than 2 weeks
//from: http://stackoverflow.com/questions/19167297/in-node-delete-all-files-older-than-an-hour
async.whilst(
    function () { return true }, 
    function (callback) {

        fs.readdir(strings.IMAGE_SAVE_DESTINATION, function(err, files) {
          if (files){
            files.forEach(function(file, index) {
              fs.stat(path.join(strings.IMAGE_SAVE_DESTINATION, file), function(err, stat) {
                var endTime, now;
                if (err) {
                  return console.error(err);
                }
                now = new Date().getTime();
                endTime = new Date(stat.ctime).getTime() + 30000; //if file is older than 1 minute, remove
                if (now > endTime) {
                    
                  return rimraf(path.join(strings.IMAGE_SAVE_DESTINATION, file), function(err) {
                    if (err) {
                      return console.error(err);
                    }
                    // console.log('REMOVED FILE!')
                  });
                }
              });
            });
          }
        });

        setTimeout(callback, 300000); // Check every 5 minutes
        
    },
    function (err) {
    }
);



app.listen(3130, function() {
    console.log("3130 ~ ~");
});

