/*
_|_|_|              _|                              _|_|                              
  _|    _|_|_|    _|_|_|_|    _|_|    _|  _|_|    _|        _|_|_|    _|_|_|    _|_|  
  _|    _|    _|    _|      _|_|_|_|  _|_|      _|_|_|_|  _|    _|  _|        _|_|_|_|
  _|    _|    _|    _|      _|        _|          _|      _|    _|  _|        _|      
_|_|_|  _|    _|      _|_|    _|_|_|  _|          _|        _|_|_|    _|_|_|    _|_|_|
                                                                                      
_|_|_|_|                                    _|                    
_|        _|_|    _|    _|  _|_|_|      _|_|_|  _|  _|_|  _|    _|
_|_|_|  _|    _|  _|    _|  _|    _|  _|    _|  _|_|      _|    _|
_|      _|    _|  _|    _|  _|    _|  _|    _|  _|        _|    _|
_|        _|_|      _|_|_|  _|    _|    _|_|_|  _|          _|_|_|
                                                                _|
                                                            _|_|  

  interfacefoundry.com <3 <3 <3 

  v0.2 Illya 
*/



var fs = require('fs');
var im = require('imagemagick'); //must also install imagemagick package on server /!\
var async = require('async');
var moment = require('moment');
var http = require('http');
var connectBusboy = require('connect-busboy');
var mmm = require('mmmagic'), Magic = mmm.Magic;
var configDB = require('./server_auth/database.js');
var mailerTransport = require('./components/IF_mail/IF_mail.js');
var crypto = require('crypto');
var User = require('./app/models/user');


var passport = require('passport');
var flash    = require('connect-flash');

var urlify = require('urlify').create({
  addEToUmlauts:true,
  szToSs:true,
  spaces:"_",
  nonPrintable:"_",
  trim:true
});

var request = require('request');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

var bodyParser = require('body-parser');
var integers = require('./server_bubblequery/constants/integers');
var strings = require('./server_bubblequery/constants/strings');
var bubble = require('./server_bubblequery/handlers/bubble');


//----MONGOOOSE----//
var mongoose = require('mongoose'),
    landmarkSchema = require('./landmark_schema.js'),
    styleSchema = require('./style_schema.js'),
    projectSchema = require('./project_schema.js'),
    monguurl = require('monguurl');


mongoose.connect(configDB.url); 
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));

//---------------//

require('./server_auth/passport')(passport); // pass passport for configuration

//socket.io init
var socket = require('./socket_chat/socket.js');

//express init
var express = require('express'),
    app = module.exports.app = express(),
    db = require('mongojs').connect('if');

    var server = http.createServer(app);
    // Hook Socket.io into Express
    var io = require('socket.io').listen(server);

    app.use(express.static(__dirname + '/app'));


    //===== PASSPORT =====//
    // set up our express application
    app.use(morgan('dev')); // log every request to the console
    app.use(cookieParser()); // read cookies (needed for auth)

    app.use(bodyParser.urlencoded({
      extended: true
    })); // get information from html forms

    app.use(bodyParser.json({
      extended: true
    })); // get information from html forms


    // required for passport
    app.use(session({ secret: 'rachelwantstomakecakebutneedseggs' })); // session secret to 'prevent' session hijacking 
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

    //===================//


//======= RESET PASSWORD MAILER ======//

// var multiparty = require('multiparty');
// var form = new multiparty.Form();

// var forgot = require('password-reset')({
//     uri : 'https://bubbl.li/password_reset',
//     from : 'mail@localhost',
//     host : 'localhost', 
//     port : 25,
//     strictSSL: false,
//     rejectUnauthorized: false
// });

// app.use(forgot.middleware);

app.post('/forgot', function (req, res, next) {

  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ 'local.email': req.body.email }, function(err, user) {
        if (!user) {
          console.log('No account with that email address exists, or you logged in through facebook/twitter');
          return res.redirect('/forgot');
        }

        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {

      var mailOptions = {
        to: user.local.email,
        from: 'IF Bubbl <mail@bubbl.li>',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      mailerTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/#/forgot');
  });

});


app.get('/reset/:token', function(req, res) {
  User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/#/forgot');
    }
    // else {
    //     //res.send(user);

    // }
    // res.render('reset', {
    //   user: req.user
    // });
  });
});


app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        if (req.body.password.length >= 6){
            user.local.password = req.body.password;
            user.local.resetPasswordToken = undefined;
            user.local.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
        }
        else {
            return done('Password needs to be at least 6 characters');  
        }

      });
    },
    function(user, done) {

      var mailOptions = {
        to: user.local.email,
        from: 'IF Bubbl <mail@bubbl.li>',
        subject: 'Node.js Password Reset',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
      };
      mailerTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
        done(err, 'done');
      });

    }
  ], function(err) {
    res.redirect('/#/');
  });
}); 

// app.post('/reset', function (req, res) {
//     // if (!req.session.reset) return res.end('reset token not set');

//     // var password = req.body.password;
//     // var confirm = req.body.confirm;
//     // if (password !== confirm) return res.end('passwords do not match');

//     // // update the user db here

//     // forgot.expire(req.session.reset.id);
//     // delete req.session.reset;
//     // res.end('password reset');
// });
// //====================================//



//LIMITING UPLOADS TO 10MB 
app.use(connectBusboy({
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }
}));


// Socket.io Communication
io.sockets.on('connection', socket);

// io.set('transports', [                     // enable all transports (optional if you want flashsocket)
//     'websocket'
//   , 'jsonp-polling'
// ]);

// passport routes ======================================================================
require('./app/auth_routes.js')(app, passport, landmarkSchema); // load our routes and pass in our app and fully configured passport

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


/// USE A SWITCH HERE TO SWITCH BETWEEN REQUESTS /////

  // switch (req.uri.path) {
  //   case '/':
  //     display_form(req, res);
  //     break;
  //   case '/upload':
  //     upload_file(req, res);
  //     break;
  //   default:
  //     show_404(req, res);
  //     break;
  // }

//////////////////////////


// Query
app.get('/api/:collection', function(req, res) { 

    var item, sort = {};

    //route to world
    if (req.params.collection == 'worlds'){
        bubble.listBubbles(req,res);
    }

    //querying landmark collection (events, places, etc)
    if (req.params.collection == 'landmarks'){

        //if has parentID parameter (world landmark query)
        if (req.query.parentID){
            var qw = {
                parentID:req.query.parentID,
                world:false
            };   
            db.collection(req.params.collection).find(qw).sort({_id: -1}).toArray(fn(req, res));  
        }

        //not a world landmark query
        else {

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

                    // CHANGE THIS LOGIC to be WORLD QUERY - so it queries the correct world
                    //IF HAS SUB CATEGORY (LIKE LECTURES)
                    if (req.query.queryCat){

                        if (req.query.userTime){
                            var currentTime = new Date(req.query.userTime);
                        }

                        else {
                            var currentTime = new Date();
                        }
                        
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
            db.collection('instagrams').find(qw).sort({_id: -1}).toArray(fn(req, res));
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

// Search

app.get('/api/textsearch', function(req, res) {
    landmarkSchema.find(
        { $text : { $search : req.body.textQuery } },
        { score : { $meta: "textScore" } }
      ).
      sort({ score : { $meta : 'textScore' } }).
      limit(100).
      exec(function(err, data) {
        if (data){
            res.send(data);
        }
        else {
            console.log('no results');
            res.send({err:'no results'});            
        }
      });
});



// Read 
app.get('/api/:collection/:id', function(req, res) {

    //world
    if (req.url.indexOf("/api/worlds/") > -1){

        db.collection('landmarks').findOne({id:req.params.id,world:true}, function(err, data){

            if (data){
                styleSchema.findById(data.style.styleID, function(err, style) {
                      if (!style){
                        console.log(err);
                      }

                    if(style) {
                        console.log(style);
                        var resWorldStyle = {
                            "world" : data,
                            "style" : style
                        };
                        res.send(resWorldStyle);
                    }

                }); 
            }
            else {
                console.log('world doesnt exist');
                res.send({err:'world doesnt exist'});
            }      

        });  

    
    }
    //landmark
    else {
        db.collection(req.params.collection).findOne({id:req.params.id,world:false}, fn(req, res));
    }
});

// Save 
app.post('/api/:collection/create', isLoggedIn, function(req, res) {

    if (req.url == "/api/styles/create"){

        editStyle();
    }

    if (req.url == "/api/projects/create"){

        editProject();
    }

    //a world
    if (req.url == "/api/worlds/create"){
        var worldVal = true;

        if (req.body.editMap){ //adding map options to world
            worldMapEdit();
        }

        else {
            contSaveLandmark();
        }
    }
    //a landmark
    else if (req.url == "/api/landmarks/create"){
        var worldVal = false;
        contSaveLandmark();
    }


    function worldMapEdit(){ //adding/editing map to world
   
         landmarkSchema.findById(req.body.worldID, function(err, lm) {
          if (!lm){
            console.log(err);
          }
          else if (req.user._id == lm.permissions.ownerID){

            lm.style.maps.type = req.body.type;
            lm.style.maps.cloudMapID = req.body.mapThemeSelect.cloudMapID;
            lm.style.maps.cloudMapName = req.body.mapThemeSelect.cloudMapName;

            //NEED TO CHANGE TO ARRAY to push new marker types, eventually
            lm.style.markers = {
                name:req.body.markerSelect.name, 
                category:'all'
            };

            lm.save(function(err, landmark) {
                if (err){
                    console.log('error');
                }
                else {
                    console.log(landmark);
                    console.log('success');
                }
            });
          }
          else {
            console.log('unauthorized user');
          }
        });       

    }

    function contSaveLandmark(){

        if (!req.body.name){
            console.log('must have name');
        }

        else {

            //FIND UNique ID based on user inputted Name

            // FIX ALL THIS!!!!!!!, needs to not gen another unique ID if EDIT
            if (!req.body.newStatus){ //detecting if new landmark or an edit

                idGen(req.body.name);

                // if (req.body.idCheck == req.body.id){
                //     saveLandmark(req.body.id);
                // }
                // else {
                //     idGen(req.body.name);
                // }
            }

            else {
                idGen(req.body.name);
            }
        }

        function idGen(input){

            var uniqueIDer = urlify(input);
            urlify(uniqueIDer, function(){
                db.collection('landmarks').findOne({'id':uniqueIDer,'world':worldVal}, function(err, data){

                    if (data){
                        var uniqueNumber = 1;
                        var newUnique;

                        async.forever(function (next) {
                          var uniqueNum_string = uniqueNumber.toString(); 
                          newUnique = data.id + uniqueNum_string;

                          db.collection('landmarks').findOne({'id':newUnique,'world':worldVal}, function(err, data){
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
            

            //an edit
            if (!req.body.newStatus){

                if (req.body.worldID){
                    var lookupID = req.body.worldID;
                }

                if (req.body._id){
                    var lookupID = req.body._id;
                }         
                
                console.log(lookupID);
                
                landmarkSchema.findById(lookupID, function(err, lm) {
                  if (!lm){
                    console.log(err);
                  }
                  else if (req.user._id == lm.permissions.ownerID){ //checking if logged in user is owner
                    
                    lm.name = req.body.name;
                    lm.id = finalID;
                    lm.valid = 1;
                    lm.loc = {type:'Point', coordinates:[req.body.loc.coordinates[0],req.body.loc.coordinates[1]] };
                    
                    if (req.body.avatar){
                    	lm.avatar = req.body.avatar;
                    }

                    if (req.body.parentID){
                        lm.parentID = req.body.parentID;
                    }

                    if (req.body.description){
                        lm.description = req.body.description;
                    }
                    if (req.body.summary){
                        lm.summary = req.body.summary;
                    }
                    if (req.body.category){
                        lm.category = req.body.category;
                    }

                    if (req.body.hashtag){
                        lm.resources.hashtag = req.body.hashtag;
                    }

                    //if user checks box to activate time 
                    if (req.body.hasTime == true){

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

                    lm.save(function(err, landmark) {
                        if (err){
                        	console.log(err);
                            console.log('lm.save error');
                        }
                        else {
                            console.log(landmark);
                            console.log('success');
                        }
                    });
                  }
                  else {
                    console.log('unauthorized user');
                  }
                });

            }

            //not an edit
            else {


                //new world
                if (worldVal){
                    saveStyle(req.body.name, function(styleRes){ //creating new style to add to landmark
                        saveNewLandmark(styleRes);
                    });
                }

                //new landmark
                else {

                    //checking for auth of parent ID (world) to add new landmarks...bad security if attacker changes world val?? idk!

                    landmarkSchema.findById(req.body.parentID, function(err, lm) {
                        if (!lm){
                            console.log(err);
                        }
                        else if (req.user._id == lm.permissions.ownerID){ //checking if logged in user is owner
                            saveNewLandmark();
                        }
                        else {
                            console.log('unauthorized user');
                        }
                    });



                    
                }

                function saveNewLandmark(styleRes){
                    var lm = new landmarkSchema({
                        name: req.body.name,
                        id: finalID,
                        world: worldVal,
                        valid: 1,
                        loc: {type:'Point', coordinates:[req.body.loc.coordinates[0], req.body.loc.coordinates[1]]},
                        avatar: req.body.avatar,
                        permissions: {
                            ownerID: req.user._id //from auth user ID
                        }
                    });

                    if (styleRes !== undefined){ //if new styleID created for world
                        lm.style.styleID = styleRes;
                    }

                    if (req.body.parentID){
                        lm.parentID = req.body.parentID;
                    }

                    if (req.body.description){
                        lm.description = req.body.description;
                    }
                    if (req.body.summary){
                        lm.summary = req.body.summary;
                    }
                    if (req.body.category){
                        lm.category = req.body.category;
                    }

                    if (req.body.hashtag){
                        lm.resources.hashtag = req.body.hashtag;
                    }

                    //if user checks box to activate time 
                    if (req.body.hasTime == true){

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

                    lm.save(function (err, landmark) {
                        if (err)
                            console.log(err);
                        else{
                            console.log(landmark);
                            //world created
                            if (worldVal == true){
                                saveProject(landmark._id, styleRes, req.user._id, function(projectRes){
                                    
                                    var idArray = [{'worldID': landmark._id, 'projectID':projectRes,'styleID':styleRes,'worldURL':landmark.id}];
                                    res.send(idArray);
                                });
                            }

                            //landmark created
                            else {
                                res.send([{"_id":landmark._id}]);
                            }
                         
                        }
                    });

                }             
            }


        }

        function saveStyle(inputName, callback){

            var st = new styleSchema({
                name: inputName
            });
            
            saveIt(function (res) {
                callback(res);
            });
            
            function saveIt(callback){
                st.save(function (err, style) {
                    if (err)
                        console.log(err);
                    else {
                        callback(style._id);
                    }
                });
            }

        }




        function saveProject(world,style,owner,callback){

            var pr = new projectSchema({
                worldID: world,
                styleID: style,
                permissions: {
                    ownerID: owner
                }
            });

            saveIt(function (res) {
                callback(res);
            });
            
            function saveIt(callback){
                pr.save(function (err, project) {
                    if (err)
                        console.log(err);
                    else {
                        callback(project._id);
                    }
                });
            }   
        }

    }

        function editProject(input){
             projectSchema.findById(req.body.projectID, function(err, lm) {
              if (!lm){
                console.log(err);
              }
              else if (req.user._id == lm.permissions.ownerID) {

                lm.save(function(err, style) {
                    if (err){
                        console.log('error');
                    }
                    else {
                        console.log(style);
                        console.log('success');
                    }
                });
              }
            });             
        }

        function editStyle(input){

         styleSchema.findById(req.body.styleID, function(err, lm) {
          if (!lm){
            console.log(err);
          }
          else {

            console.log(req.body);
            lm.bodyBG_color = req.body.bodyBG_color; // RGB Hex
            lm.cardBG_color = req.body.cardBG_color; // RGB Hex
            lm.titleBG_color = req.body.titleBG_color; //RGB Hex
            lm.navBG_color = req.body.navBG_color;

            lm.cardBorder = req.body.cardBorder; // off by default
            lm.cardBorder_color = req.body.cardBorder_color; // RGB Hex
            lm.cardBorder_corner = req.body.cardBorder_corner; // px to round

            lm.worldTitle_color = req.body.worldTitle_color; // RGB Hex
            lm.landmarkTitle = req.body.landmarkTitle; // off by default
            lm.landmarkTitle_color = req.body.landmarkTitle_color; // RGB Hex
            lm.categoryTitle = req.body.categoryTitle; // off by default
            lm.categoryTitle_color = req.body.categoryTitle_color; // RGB Hex
            lm.accent = req.body.accent; // off by default
            lm.accent_color = req.body.accent_color; // RGB Hex
            lm.bodyText = req.body.bodyText; // off by default
            lm.bodyText_color = req.body.bodyText_color; // RGB Hex

            lm.bodyFontName = req.body.bodyFontName; // font name
            lm.bodyFontFamily = req.body.bodyFontFamily; // font family
            lm.themeFont = req.body.themeFont; // off by default
            lm.themeFontName = req.body.themeFontName; // font name

            lm.save(function(err, style) {
                if (err){
                    console.log('error');
                }
                else {
                    console.log(style);
                    console.log('success');
                }
            });
          }
        }); 

    }

});

// Delete
app.delete('/api/:collection/:id', isLoggedIn, function(req, res) {
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


app.post('/api/upload', isLoggedIn, function (req, res) {

    //disabled Max image upload size for NOW << enable later...
   // if (req.files.files[0].size <= 5242880){

        // SET FILE SIZE LIMIT HERE 
        //FILTER ANYTHING BUT GIF JPG PNG

        var fstream;
        req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, filename, filesize, mimetype) {

             ////// SECURITY RISK ///////
             ///////// ------------------> enable mmmagic to check MIME type of incoming data ////////
             // var parseFile = JSON.stringify(req.files.files[0]);
             // console.log(parseFile);
             // var magic = new Magic(mmm.MAGIC_MIME_TYPE);
             //  magic.detectFile(parseFile, function(err, result) {
             //      if (err){ throw err};
             //      console.log(result);
             //      // output on Windows with 32-bit node:
             //      //    application/x-dosexec
             //  });
              ///////////////////////////

            var fileName = filename.substr(0, filename.lastIndexOf('.')) || filename;
            var fileType = filename.split('.').pop();

            if (mimetype == 'image/jpg' || mimetype == 'image/png' || mimetype == 'image/gif' ){

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

                        fstream = fs.createWriteStream(newPath);
                        file.pipe(fstream);
                        fstream.on('close', function () {
                             im.crop({
                              srcPath: newPath,
                              dstPath: newPath,
                              width: 100,
                              height: 100,
                              quality: 85,
                              gravity: "Center"
                            }, function(err, stdout, stderr){

                                res.send("uploads/"+current);

                            });                       
                        });

                        break;
                    }
                }

            }

            else {
                console.log('Please use .jpg .png or .gif');
                res.send(500,'Please use .jpg .png or .gif');
            }



        });

});


//map upload
app.post('/api/upload_maps', isLoggedIn, function (req, res) {

    // TEMPORARY FILE UPLOAD AND DELETE, needs to direct stream from form upload....
    var fstream;

    req.pipe(req.busboy);

    req.busboy.on('file', function (fieldname, file, filename, filesize, mimetype) {

         ////// SECURITY RISK ///////
         ///////// ------------------> enable mmmagic to check MIME type of incoming data ////////
         // var parseFile = JSON.stringify(req.files.files[0]);
         // console.log(parseFile);
         // var magic = new Magic(mmm.MAGIC_MIME_TYPE);
         //  magic.detectFile(parseFile, function(err, result) {
         //      if (err){ throw err};
         //      console.log(result);
         //      // output on Windows with 32-bit node:
         //      //    application/x-dosexec
         //  });
          ///////////////////////////

        var fileName = filename.substr(0, filename.lastIndexOf('.')) || filename;
        var fileType = filename.split('.').pop();

        if (mimetype == 'image/jpg' || mimetype == 'image/png'){

            while (1) {

                var fileNumber = Math.floor((Math.random()*100000000)+1); //generate random file name
                var fileNumber_str = fileNumber.toString(); 
                var current = fileNumber_str + '.' + fileType;

                //checking for existing file, if unique, write to dir
                if (fs.existsSync("app/temp_map_uploads/" + current)) {
                    continue; //if there are max # of files in the dir this will infinite loop...
                } 
                else {

                    var newPath = "app/temp_map_uploads/" + current;

                    fstream = fs.createWriteStream(newPath);
                    file.pipe(fstream);
                    fstream.on('close', function() {
                        res.send("temp_map_uploads/"+current);
                    }); 
                    break;
                }
            }
        }
        else {
            console.log('Please use .jpg .png or .gif');
            res.send(500,'Please use .jpg .png or .gif');
        }
    });
});


//map send to tile server
app.post('/api/build_map', isLoggedIn, function (req, res) {

    console.log(req.body);

    //this entire area hurts my eyes, i can't even D:

    var map_text = JSON.stringify(req.body.coords); 
    map_text = map_text.replace(/\\"/g, '%22'); //ugh idk, just do it

    // after file saved locally, send to IF-Tiler server
    var r = request.post('http://107.170.180.141:3000/api/upload', function optionalCallback (err, httpResponse, body) {
      if (err) {

            if (fs.existsSync(__dirname + '/app/'+ req.body.mapIMG)) {
                //delete temp file
                fs.unlink(__dirname + '/app/'+ req.body.mapIMG, function (err) {
                  if (err) throw err;
                  console.log('successfully deleted '+__dirname + '/app/'+ req.body.mapIMG);
                });              
            }
            else {
                console.log('could not delete, file does not exist: '+__dirname + '/app/'+ req.body.mapIMG);
            }


        return console.error('upload failed:', err);
      }

      else{
        console.log('Upload successful! Server responded with:', body);

        worldMapTileUpdate(req, res, body, req.mapBuild);

            if (fs.existsSync(__dirname + '/app/'+ req.body.mapIMG)) {
                //delete temp file
                fs.unlink(__dirname + '/app/'+ req.body.mapIMG, function (err) {
                  if (err) throw err;
                  console.log('successfully deleted '+__dirname + '/app/'+ req.body.mapIMG);
                });
            }
            else {
                console.log('could not delete, file does not exist: '+__dirname + '/app/'+ req.body.mapIMG);
            }


       }
    });

    var form = r.form();
    //form.append('my_field', fieldname);
    form.append('my_buffer', new Buffer([1, 2, 3]));
    form.append(map_text, fs.createReadStream(__dirname + '/app/'+ req.body.mapIMG)); //passing fieldname as json cause ugh.

});



function worldMapTileUpdate(req, res, data, mapBuild){ //adding zooms, should be incorp into original function

    var tileRes = JSON.parse(data); //incoming box coordinates

     landmarkSchema.findById(tileRes.worldID, function(err, lm) {
      if (!lm){
        console.log(err);
      }
      else if (req.user._id == lm.permissions.ownerID){

        var min = tileRes.zooms[0];
        var max = tileRes.zooms.slice(-1)[0];

        lm.style.maps = {
            localMapID: tileRes.mapURL, 
            localMapName: tileRes.worldID
        };

        lm.style.maps.localMapOptions = {
            minZoom: min,
            maxZoom: max,
            attribution: "IF",
            reuseTiles: true,
            tms: true
        }

        //NEED TO CHANGE TO ARRAY to push new marker types, eventually
      //  lm.style.markers = {name:req.body.markerSelect.name, category:'all'};

        lm.save(function(err, landmark) {
            if (err){
                console.log('error');
            }
            else {
                console.log(landmark);
                console.log('success');
                res.send(landmark);
            }
        });
      }
      else {
        console.log('unauthorized user');
      }
    });       
}


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) 
        res.send(401);  //send unauthorized 
    else 
        return next();
}


server.listen(2997, function() {
    console.log("Illya casting magic on 2997 ~ ~ ♡");
});















