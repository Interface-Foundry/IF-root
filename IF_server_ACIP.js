/*
.===.      .                    .
  |  o     |                    |
  |  .  .-.| .-. .,-.  .-.  .-. | .==.
  |  | (   |(.-' |   )(   )(   )| `==.
  '-' `-`-'`-`=='|`-'  `-'  `-' `-`==' Mobile ≈☯ v0.3
                 |
                 '
  J.R. Baldwin & Open Technology Institute  
  tidepools.co <3 <3 <3 
*/




var fs = require('fs');
var im = require('imagemagick'); //must also install imagemagick package on server /!\
var async = require('async');
var moment = require('moment');

var urlify = require('urlify').create({
  addEToUmlauts:true,
  szToSs:true,
  spaces:"_",
  nonPrintable:"_",
  trim:true
});


//----MONGOOOSE----//
var mongoose = require('mongoose'),
    landmarkSchema = require('./landmark_schema.js'),
    monguurl = require('monguurl');

mongoose.connect('mongodb://localhost/aicp');
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//


var express = require('express'),
    app = module.exports.app = express(), 
    db = require('mongojs').connect('aicp');


    
app.configure(function () {
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.logger('dev'));  //tiny, short, default
	app.use(app.router);
	app.use(express.static(__dirname + '/app'));
	app.use(express.errorHandler({dumpExceptions: true, showStack: true, showMessage: true}));
});

/* Helpers */

//Parts of express code from: https://github.com/dalcib/angular-phonecat-mongodb-rest
//To allow use ObjectId or other any type of _id
var objectId = function (_id) {
    if (_id.length === 24 && parseInt(db.ObjectId(_id).getTimestamp().toISOString().slice(0,4), 10) >= 2010) {
        return db.ObjectId(_id);
    } 
    return _id;
}

//Function callback
var fn = function (req, res) {
    res.contentType('application/json');
    var fn = function (err, doc) { 
        if (err) { 
            if (err.message) {
                doc = {error : err.message} 
            } else {
                doc = {error : JSON.stringify(err)} 
            }
        }
        if (typeof doc === "number" || req.params.cmd === "distinct") { doc = {ok : doc}; } 
        res.send(doc); 
    };
    return fn;
};

/* Routes */

// Query
app.get('/api/:collection', function(req, res) { 

    var item, sort = {};

    // console.log(req.params.collection);

    // if (req.params.collection == 'worlds'){

    //     console.log(req.query.userLat);
    //     console.log(req.query.userLon);

    //     var qw = {
    //         // 'world' : 1,
    //         geo: { Building.collection.geoNear(longitude, latitude, {maxDistance: radius }, cb);}
    //     };
    //     db.collection(req.params.collection).find(qw).toArray(fn(req, res));
    // }

    //querying landmark collection (events, places, etc)
    if (req.params.collection == 'landmarks'){

 

        //return all items in landmarks
        if (req.query.queryType == "all"){
            var qw = {};
            var limit;
            db.collection(req.params.collection).find(qw).limit(limit).sort({_id: -1}).toArray(fn(req, res));         
        }


        //events
        if (req.query.queryType == "events"){

            //GET ALL EVENTS
            if (req.query.queryFilter == "all"){
    
                //IF HAS SUB CATEGORY (LIKE LECTURES)
                if (req.query.queryCat){

                    var qw = {
                        'type' : 'event',
                        'subType' : req.query.queryCat
                    };
                    db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));

                }

                else {

                    var qw = {
                        'type' : 'event'
                    };
                    db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));
                }
   
            }

            // EVENTS HAPPENING NOW
            if (req.query.queryFilter == "now"){


                //IF HAS SUB CATEGORY (LIKE LECTURES)
                if (req.query.queryCat){

                    var currentTime = new Date();
                    //var currentTime = new Date('Jun 10 2014 10:46:06 GMT-0400 (EDT)');
      
                    var qw = {
                        'time.start': {$lt: currentTime},
                        'time.end': {$gt: currentTime},
                        'subType' : req.query.queryCat
                    };
                    db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));
                }

                else {

                    var currentTime = new Date();
                    //var currentTime = new Date('Jun 11 2014 11:16:06 GMT-0400 (EDT)');
                    
                    var qw = {
                        'time.start': {$lt: currentTime},
                        'time.end': {$gt: currentTime}
                    };
                    db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));

                }


            }

            //EVENTS UPCOMING
            if (req.query.queryFilter == "upcoming"){

                //IF HAS SUB CATEGORY (LIKE LECTURES)
                if (req.query.queryCat){


                    //FIRST QUERY FOR NOW

                    //var currentTime = new Date();
                    //var currentTime = new Date('Jun 11 2014 09:44:06 GMT-0400 (EDT)');

                    //TEMP ONLY WORKS WITH 1 HAPPENING NOW OBJECT

                    console.log(req.query.nowTimeEnd);

                    if (req.query.nowTimeEnd !== "noNow"){

                        if (req.query.nowTimeEnd == "upcomingToday"){



                            //var nowTimeEnd = new Date('Jun 11 2014 11:16:06 GMT-0400 (EDT)');
                            var nowTimeEnd = new Date();

                        }

                        else {
                            var nowTimeEnd = new Date(req.query.nowTimeEnd);
                        }

                        
                        console.log(nowTimeEnd);
                           

                        nowTimeEnd.setSeconds(nowTimeEnd.getSeconds() - 1);

                

                        //ADD IN LESS THAN TIME FOR END OF DAY!!!!!!!!!
                        //so only get upcmoning events till end of day
                        // var endofDay = new Date('Jun 11 2014 10:16:06 GMT-0400 (EDT)');
                        // endofDay.setHours(23,59,59,999);

                        


                        var qw = {
                            'time.start': {$gt: nowTimeEnd},
                            // 'time.end': {$lt: endofDay},
                            'subType' : req.query.queryCat
                        };
                        db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));

                    }

                    else {
                        //var currentTime = new Date('Jun 11 2014 11:16:06 GMT-0400 (EDT)');
                        var currentTime = new Date();

                        var qw = {
                            'time.start': {$gt: currentTime},
                            'subType' : req.query.queryCat
                        };
                        db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));
                    }
                    
                    // //var currentTime = new Date();
                    // var currentTime = new Date('Jun 11 2014 09:44:06 GMT-0400 (EDT)');
                    
                    // currentTime.setMinutes(currentTime.getMinutes() + 45); // adding 30minutes to current time for "soon"
                    // var qw = {
                    //     'time.start': {$lt: currentTime},
                    //     'time.end': {$gt: currentTime},
                    //     'subType':req.query.queryCat
                    // };
                    // db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));


                }

                else {

                    var currentTime = new Date();
                    //var currentTime = new Date('Jun 11 2014 11:16:06 GMT-0400 (EDT)');
                    
                    currentTime.setMinutes(currentTime.getMinutes() + 45); // adding 30minutes to current time for "soon"
                    var qw = {
                        'time.start': {$lt: currentTime},
                        'time.end': {$gt: currentTime}
                    };
                    db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));                   
                }
            }

            // EVENTS TODAY
            if (req.query.queryFilter == "today"){

                //getting today & tomm
                var tod = new Date();
                var tom = new Date();
                

                tom.setDate(tod.getDate()+1);
                tod.setHours(0,0,0,0);
                tom.setHours(0,0,0,0);

                var qw = {
                    'time.start': {
                        $gte: tod,
                        $lt: tom
                    }
                };
                db.collection(req.params.collection).find(qw).sort({'time.start': 1}).toArray(fn(req, res));

            }


        }

        //places
        if (req.query.queryType == "places"){

            //do a location radius search here option

            console.log(req.query.queryFilter);

            if (req.query.queryFilter == "all"){
                var qw = {
                    'type' : 'place'
                };
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
            }

            else {
                var qw = {
                    'subType' : req.query.queryFilter
                };
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
            }

        }

        //search
        if (req.query.queryType == "search"){

            var searchResults = {};

            var qw = {
                "name" : {$regex : ".*"+req.query.queryFilter+".*", $options: 'i'}
            };
            db.collection('landmarks').find(qw).sort({_id: -1}).toArray(addSearch(req,res));
            //searchResults.push(search);

           

            function addSearch(req,res){


                 // console.log(req);
                 console.log(res);
            }

            //.sort({_id: -1}).toArray(fn(req, res));
        }

    }


    //querying tweets (social media and internal comments too, eventually)
    if (req.params.collection == 'tweets'){

        if (req.query.tag){ //hashtag filtering
            var qw = {
               'text' : {$regex : ".*"+req.query.tag+".*", $options: 'i'}
            };
            db.collection('tweets').find(qw).sort({_id: -1}).toArray(fn(req, res));
        }

        else {

            if (req.query.limit){ //limited tweet query
                limit = parseInt(req.query.limit);
                db.collection(req.params.collection).find(qw).limit(limit).sort({_id: -1}).toArray(fn(req, res));
            }

            else {
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
            }
        }
    }

        //querying tweets (social media and internal comments too, eventually)
    if (req.params.collection == 'instagrams'){

        if (req.query.tag){ //hashtag filtering
            var qw = {
               'text' : {$regex : ".*"+req.query.tag+".*", $options: 'i'}
            };
            db.collection('tweets').find(qw).sort({_id: -1}).toArray(fn(req, res));
        }

        else {

            if (req.query.limit){ //limited tweet query
                limit = parseInt(req.query.limit);
                db.collection(req.params.collection).find(qw).limit(limit).sort({_id: -1}).toArray(fn(req, res));
            }

            else {
                db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));
            }
        }
    }


});

// Read 
app.get('/api/:collection/:id', function(req, res) {
    db.collection(req.params.collection).findOne({id:objectId(req.params.id)}, fn(req, res));
});

// Save 
app.post('/api/:collection/create', function(req, res) {

    //console.log(req.url);

    
    if (req.url == "/api/worlds/create"){
        var worldVal = 1;
    }

    else {

        var worldVal = 0;
    }


    if (!req.body.name){
        console.log('must have name');
    }

    else {

        //FIND UNique ID based on user inputted Name

        if (req.body._id){ //detecting if new landmark or an edit
            if (req.body.idCheck == req.body.id){
                saveLandmark(req.body.id);
            }
            else {
                idGen(req.body.name);
            }
        }

        else {
            idGen(req.body.name);
        }
    }

    function idGen(input){

        var uniqueIDer = urlify(input);
        urlify(uniqueIDer, function(){
            db.collection('landmarks').findOne({'id':uniqueIDer}, function(err, data){

                if (data){
                    var uniqueNumber = 1;
                    var newUnique;

                    async.forever(function (next) {
                      var uniqueNum_string = uniqueNumber.toString(); 
                      newUnique = data.id + uniqueNum_string;

                      db.collection('landmarks').findOne({'id':newUnique}, function(err, data){
                        if (data){
                          console.log('entry found!');
                          uniqueNumber++;
                          next();
                        }
                        else {
                          console.log('entry not found!');
                          next('unique!'); // This is where the looping is stopped
                        }
                      });
                    },
                    function () {
                      saveLandmark(newUnique);
                    });
                }
                else {
                    saveLandmark(uniqueIDer);
                }
            });
        });

    }

    function saveLandmark(finalID){
        
        //EDITING A LANDMARK
        if (req.body._id){ //temp way to detect landmark edit by checking if mongo already generated _id

            var landmarkModel = mongoose.model('landmark', landmarkSchema, 'landmarks');

            landmarkModel.findOne({ id: req.body.id }, function (err, lm) {

                if (err)
                    console.log(err);

                else {

                    lm.name = req.body.name;
                    lm.id = finalID;
                    lm.type = req.body.type;
                    lm.subType = req.body.subType;
                    lm.stats.avatar = req.body.stats.avatar;
                    lm.mapID = "TidepoolsBaseMap"; //compatibility with Old Tidepools Interface

                    if (req.body.description){
                        lm.description = req.body.description;
                    }
                    if (req.body.shortDescription){
                        lm.shortDescription = req.body.shortDescription;
                    }
                    if (req.body.video){
                        lm.video = req.body.video;
                    }

                    if (req.body.people){
                        lm.people = req.body.people;
                    }
        
                    if (req.body.extraURL){

                        console.log('adding url');
                        lm.extraURL = req.body.extraURL;
                    }

                    if (!req.body.extraURL){

                        console.log('removing url');
                        lm.extraURL = undefined;
                    }



                    if (req.body.type == "event"){

                        lm.timetext.datestart = req.body.datetext.start;
                        lm.timetext.dateend = req.body.datetext.end;
                        lm.timetext.timestart = req.body.timetext.start;
                        lm.timetext.timeend = req.body.timetext.end;

                        //------ Combining Date and Time values -----//
                        var timeStart = req.body.time.start;
                        var timeEnd = req.body.time.end;

                        var dateStart = req.body.date.start;
                        var dateEnd = req.body.date.end;

                        var datetimeStart = new Date(dateStart+' '+timeStart);
                        var datetimeEnd = new Date(dateEnd+' '+timeEnd);
                        //----------//

                        lm.time.start = datetimeStart;
                        lm.time.end = datetimeEnd;
                    }
                    
                    lm.loc.length = 0;
                    lm.loc.unshift(req.body.loc[0],req.body.loc[1]);

                    if (req.body.location){
                        lm.loc_nickname = req.body.location;
                    }    

                    if (req.body.tags){
                        
                        var newTag = req.body.tags.replace(/[^ \w]+/, '');
                        //lm.tags.addToSet(newTag);
                        lm.tags = newTag;
                        
                    }     

                    lm.save(function (err, landmark) {
                        if (err)
                            console.log(err);
                        else{
                            console.log(null, landmark);
                            //console.log(finalID);
                            var idArray = [{'id': finalID}];
                            res.send(idArray);
                        }
                    });
                }
            });         
        }
            
        //NEW LANDMARK
         else { //not an edit, a new landmark entirely

                var landmarkModel = mongoose.model('landmark', landmarkSchema, 'landmarks');  
                var lm = new landmarkModel();

                lm.name = req.body.name;
                lm.id = finalID;
                lm.world = worldVal;
                lm.type = req.body.type;
                lm.subType = req.body.subType;
                lm.stats.avatar = req.body.stats.avatar;
                lm.mapID = "TidepoolsBaseMap"; //compatibility with Old Tidepools Interface

                if (req.body.description){
                    lm.description = req.body.description;
                }
                if (req.body.shortDescription){
                    lm.shortDescription = req.body.shortDescription;
                }
                if (req.body.people){
                    lm.people = req.body.people;
                }
                if (req.body.video){
                    lm.video = req.body.video;
                }

                if (req.body.extraURL){
                    lm.extraURL = req.body.extraURL;
                }

                if (req.body.type == "event"){

                    lm.timetext.datestart = req.body.datetext.start;
                    lm.timetext.dateend = req.body.datetext.end;
                    lm.timetext.timestart = req.body.timetext.start;
                    lm.timetext.timeend = req.body.timetext.end;


                    //------ Combining Date and Time values -----//
                    var timeStart = req.body.time.start;
                    var timeEnd = req.body.time.end;

                    var dateStart = req.body.date.start;
                    var dateEnd = req.body.date.end;

                    var datetimeStart = new Date(dateStart+' '+timeStart);
                    var datetimeEnd = new Date(dateEnd+' '+timeEnd);
                    //----------//

                    lm.time.start = datetimeStart;
                    lm.time.end = datetimeEnd;
                }
                

                lm.loc.unshift(req.body.loc[0],req.body.loc[1]);

                if (req.body.location){
                    lm.loc_nickname = req.body.location;
                }    

                if (req.body.tags){
                    
                    var newTag = req.body.tags.replace(/[^ \w]+/, '');
                    //lm.tags.addToSet(newTag);
                    lm.tags = newTag;
                    
                }  

            lm.save(function (err, landmark) {
                if (err)
                    console.log(err);
                else{
                    console.log(null, landmark);
                    //console.log(finalID);
                    var idArray = [{'id': finalID}];
                    res.send(idArray);
                }
            });
        }  
    }

});

// Delete
app.delete('/api/:collection/:id', function(req, res) {
   db.collection(req.params.collection).remove({_id:objectId(req.params.id)}, {safe:true}, fn(req, res));
});

//Group
app.put('/api/:collection/group', function(req, res) {
    db.collection(req.params.collection).group(req.body, fn(req, res));
})

// MapReduce
app.put('/api/:collection/mapReduce', function(req, res) {
    if (!req.body.options) {req.body.options  = {}};
    req.body.options.out = { inline : 1};
    req.body.options.verbose = false;
    db.collection(req.params.collection).mapReduce(req.body.map, req.body.reduce, req.body.options, fn(req, res));    
})

// Command (count, distinct, find, aggregate)
app.put('/api/:collection/:cmd',  function (req, res) {
    if (req.params.cmd === 'distinct') {req.body = req.body.key}
    db.collection(req.params.collection)[req.params.cmd](req.body, fn(req, res)); 
})


app.post('/api/upload',  function (req, res) {

    //disabled Max image upload size for NOW << enable later...
   // if (req.files.files[0].size <= 5242880){

        //FILTER ANYTHING BUT GIF JPG PNG


        fs.readFile(req.files.files[0].path, function (err, data) {

            var fileName = req.files.files[0].name.substr(0, req.files.files[0].name.lastIndexOf('.')) || req.files.files[0].name;
            var fileType = req.files.files[0].name.split('.').pop();

            while (1) {

                var fileNumber = Math.floor((Math.random()*100000000)+1); //generate random file name
                var fileNumber_str = fileNumber.toString(); 
                var current = fileNumber_str + '.' + fileType;

                //checking for existing file, if unique, write to dir
                if (fs.existsSync("app/uploads/" + current)) {
                    continue; //if there are max # of files in the dir this will infinite loop...
                } 
                else {
                    var newPath = "app/uploads/" + current;

                    fs.writeFile(newPath, data, function (err) {

                        im.crop({
                          srcPath: newPath,
                          dstPath: newPath,
                          width: 100,
                          height: 100,
                          quality: 1,
                          gravity: "Center"
                        }, function(err, stdout, stderr){

                        

                            res.send("uploads/"+current);

                        });
                    });

                    break;
                }
            }
        });
  //  }

  //  else {
  //      res.send('Not Saved: File is bigger than 5MB, please try again.');
  //  }

});



app.listen(2998, function() {
    console.log("Chillin' on 2998 ~ ~");
});















